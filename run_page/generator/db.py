import datetime
import random
import string
import time

from geopy.geocoders import options, Nominatim
from sqlalchemy import (
    Column,
    Float,
    Integer,
    Interval,
    String,
    create_engine,
    inspect,
    text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


# random user name 8 letters
def randomword():
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for i in range(4))


options.default_user_agent = "running_page"
# reverse the location (lat, lon) -> location detail
g = Nominatim(user_agent=randomword())


ACTIVITY_KEYS = [
    "run_id",
    "name",
    "distance",
    "moving_time",
    "type",
    "subtype",
    "start_date",
    "start_date_local",
    "location_country",
    "summary_polyline",
    "average_heartrate",
    "average_speed",
    "elevation_gain",
]
# 新增：这批文件已经自带北京时间，不需要再根据时区进行偏移
SKIP_TIMEZONE_ADJUST_IDS = [
    1759919048000,
    1742207842000,
    1727604498000,
    1728554734000,
    1728641277000,
    1728986928000,
    1729032203000,
    1730328560000,
    1730760383000,
    1730846969000,
    1731278715000,
    1731538361000,
    1732056186000,
    1732406890000,
    1732574589000,
    1732747491000,
    1733179658000,
]


class Activity(Base):
    __tablename__ = "activities"

    run_id = Column(Integer, primary_key=True)
    name = Column(String)
    distance = Column(Float)
    moving_time = Column(Interval)
    elapsed_time = Column(Interval)
    type = Column(String)
    subtype = Column(String)
    start_date = Column(String)
    start_date_local = Column(String)
    location_country = Column(String)
    summary_polyline = Column(String)
    average_heartrate = Column(Float)
    average_speed = Column(Float)
    elevation_gain = Column(Float)
    streak = None

    def to_dict(self):
        out = {}
        for key in ACTIVITY_KEYS:
            attr = getattr(self, key)
            if isinstance(attr, (datetime.timedelta, datetime.datetime)):
                out[key] = str(attr)
            else:
                out[key] = attr

        if self.streak:
            out["streak"] = self.streak

        return out


def update_or_create_activity(session, run_activity):
    created = False
    # 打印当前正在处理的 ID 和它的原始本地时间
    print(f"DEBUG: Processing ID: {run_activity.id} | Raw Local: {run_activity.start_date_local}")
    try:
        activity = (
            session.query(Activity).filter_by(run_id=int(run_activity.id)).first()
        )

        current_elevation_gain = 0.0  # default value

        # https://github.com/stravalib/stravalib/blob/main/src/stravalib/strava_model.py#L639C1-L643C41
        if (
            hasattr(run_activity, "total_elevation_gain")
            and run_activity.total_elevation_gain is not None
        ):
            current_elevation_gain = float(run_activity.total_elevation_gain)
        elif (
            hasattr(run_activity, "elevation_gain")
            and run_activity.elevation_gain is not None
        ):
            current_elevation_gain = float(run_activity.elevation_gain)

        if not activity:
            # 获取原始时间字符串，用于特征匹配
            raw_start_str = str(run_activity.start_date)
            start_date_local = run_activity.start_date_local

            # 定义这批问题文件的特征时间点（去掉日期，只看时间，或者全匹配）
            # 既然你已经有一份准确的时间清单，我们直接用时间字符串匹配
            error_time_list = [
                "2025-09-14 06:01:15", "2025-09-17 18:06:15", "2025-09-29 18:08:18",
                "2025-10-09 18:05:34", "2025-10-10 18:07:57", "2025-10-14 18:08:48",
                "2025-10-16 06:43:23", "2025-10-31 06:49:20", "2025-11-05 06:46:23",
                "2025-11-06 06:49:29", "2025-11-11 06:45:15", "2025-11-14 06:52:41",
                "2025-11-20 06:43:06", "2025-11-24 08:08:10", "2025-11-26 06:43:09",
                "2025-11-28 06:44:51", "2025-12-03 06:47:38"
            ]

            # 匹配逻辑：如果原始时间在黑名单里，或者 ID 匹配
            if raw_start_str in error_time_list or int(run_activity.id) in SKIP_TIMEZONE_ADJUST_IDS:
                print(f"!!! [MATCHED BY TIME] Found target activity: {raw_start_str}")
                start_date_local = run_activity.start_date
            else:
                print(f"DEBUG: Normal activity {raw_start_str}, keeping original local logic.")
                
            start_point = run_activity.start_latlng
            location_country = getattr(run_activity, "location_country", "")
            # or China for #176 to fix
            if not location_country and start_point or location_country == "China":
                try:
                    time.sleep(1)  # 强制每解析一条数据休息 1 秒，这样最稳
                    # 1. 执行逆地理编码请求
                    location_res = g.reverse(
                        f"{start_point.lat}, {start_point.lon}", language="zh-CN"
                    )

                    # 2. 打印返回的完整结果（包含原始字典数据）
                    print(
                        f"DEBUG: Attempting OSM reverse geocode for ID {run_activity.id}"
                    )
                    print(
                        f"DEBUG: Parameters - Lat: {start_point.lat}, Lon: {start_point.lon}"
                    )
                    print(location_res.raw if location_res else "No location found")

                    # 3. 将结果转换为字符串赋值
                    location_country = str(location_res)
                # limit (only for the first time)
                except Exception as e:
                    print(
                        f"DEBUG: OSM Request failed for ID {run_activity.id}: {str(e)}"
                    )
                    try:
                        location_country = str(
                            g.reverse(
                                f"{start_point.lat}, {start_point.lon}",
                                language="zh-CN",  # type: ignore
                            )
                        )
                    except Exception:
                        pass

            activity = Activity(
                run_id=run_activity.id,
                name=run_activity.name,
                distance=run_activity.distance,
                moving_time=run_activity.moving_time,
                elapsed_time=run_activity.elapsed_time,
                type=run_activity.type,
                subtype=run_activity.subtype,
                start_date=run_activity.start_date,
                start_date_local=start_date_local,
                location_country=location_country,
                average_heartrate=run_activity.average_heartrate,
                average_speed=float(run_activity.average_speed),
                elevation_gain=current_elevation_gain,
                summary_polyline=(
                    run_activity.map and run_activity.map.summary_polyline or ""
                ),
            )
            session.add(activity)
            created = True
        else:
            activity.name = run_activity.name
            activity.distance = float(run_activity.distance)
            activity.moving_time = run_activity.moving_time
            activity.elapsed_time = run_activity.elapsed_time
            activity.type = run_activity.type
            activity.subtype = run_activity.subtype
            activity.average_heartrate = run_activity.average_heartrate
            activity.average_speed = float(run_activity.average_speed)
            activity.elevation_gain = current_elevation_gain
            activity.summary_polyline = (
                run_activity.map and run_activity.map.summary_polyline or ""
            )
    except Exception as e:
        import traceback

        print(f"DEBUG: OSM Request failed for ID {run_activity.id}: {e}")
        traceback.print_exc()

    return created


def add_missing_columns(engine, model):
    inspector = inspect(engine)
    table_name = model.__tablename__
    columns = {col["name"] for col in inspector.get_columns(table_name)}
    missing_columns = []

    for column in model.__table__.columns:
        if column.name not in columns:
            missing_columns.append(column)
    if missing_columns:
        with engine.connect() as conn:
            for column in missing_columns:
                column_type = str(column.type)
                conn.execute(
                    text(
                        f"ALTER TABLE {table_name} ADD COLUMN {column.name} {column_type}"
                    )
                )


def init_db(db_path):
    engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)

    # check missing columns
    add_missing_columns(engine, Activity)

    sm = sessionmaker(bind=engine)
    session = sm()
    # apply the changes
    session.commit()
    return session
