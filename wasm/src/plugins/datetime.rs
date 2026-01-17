use super::typesext::I64;
use std::str::FromStr;

use chrono::{Datelike, TimeZone, Timelike};
use chrono_tz::OffsetComponents;
use mluau::prelude::*;

pub struct TimeDelta {
    pub timedelta: chrono::TimeDelta,
}

impl LuaUserData for TimeDelta {
    fn add_methods<M: LuaUserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(LuaMetaMethod::ToString, |_, this, ()| {
            Ok(this.timedelta.to_string())
        });

        methods.add_meta_method(
            LuaMetaMethod::Eq,
            |_, this, other: LuaUserDataRef<TimeDelta>| Ok(this.timedelta == other.timedelta),
        );

        methods.add_meta_method(
            LuaMetaMethod::Add,
            |_, this, other: LuaUserDataRef<TimeDelta>| {
                Ok(TimeDelta {
                    timedelta: this.timedelta.checked_add(&other.timedelta)
                        .ok_or(mluau::Error::RuntimeError("Overflow in TimeDelta addition".to_string()))?,
                })
            },
        );

        methods.add_meta_method(
            LuaMetaMethod::Sub,
            |_, this, other: LuaUserDataRef<TimeDelta>| {
                Ok(TimeDelta {
                    timedelta: this.timedelta.checked_sub(&other.timedelta)
                        .ok_or(mluau::Error::RuntimeError("Overflow in TimeDelta subtraction".to_string()))?,
                })
            },
        );

        methods.add_meta_method(
            LuaMetaMethod::Le,
            |_, this, other: LuaUserDataRef<TimeDelta>| Ok(this.timedelta <= other.timedelta),
        );

        methods.add_meta_method(
            LuaMetaMethod::Lt,
            |_, this, other: LuaUserDataRef<TimeDelta>| Ok(this.timedelta < other.timedelta),
        );

        methods.add_method("offset_string", |_, this, ()| {
            Ok(format!(
                "{}{:02}:{:02}",
                if this.timedelta.num_seconds() < 0 {
                    "-"
                } else {
                    "+"
                },
                this.timedelta.num_hours(),
                this.timedelta.num_minutes() % 60
            ))
        });
    }

    fn add_fields<F: LuaUserDataFields<Self>>(fields: &mut F) {
        fields.add_meta_field(LuaMetaMethod::Type, "TimeDelta".to_string());
        fields.add_field_method_get("nanos", |_, this| Ok(this.timedelta.num_nanoseconds()));
        fields.add_field_method_get("micros", |_, this| Ok(this.timedelta.num_microseconds()));
        fields.add_field_method_get("millis", |_, this| Ok(this.timedelta.num_milliseconds()));
        fields.add_field_method_get("seconds", |_, this| Ok(this.timedelta.num_seconds()));
        fields.add_field_method_get("minutes", |_, this| Ok(this.timedelta.num_minutes()));
        fields.add_field_method_get("hours", |_, this| Ok(this.timedelta.num_hours()));
        fields.add_field_method_get("days", |_, this| Ok(this.timedelta.num_days()));
        fields.add_field_method_get("weeks", |_, this| Ok(this.timedelta.num_weeks()));

        fields.add_field_method_get("as_secs", |_, this| Ok(this.timedelta.as_seconds_f64()));
    }

    fn register(registry: &mut LuaUserDataRegistry<Self>) {
        Self::add_fields(registry);
        Self::add_methods(registry);
        let fields = registry.fields(false).iter().map(|x| x.to_string()).collect::<Vec<_>>();
        registry.add_meta_field("__ud_fields", fields);
    }
}

pub struct DateTime<Tz>
where
    Tz: chrono::TimeZone + 'static + From<chrono_tz::Tz>,
    chrono_tz::Tz: From<Tz>,
    Tz::Offset: std::fmt::Display,
{
    pub dt: chrono::DateTime<Tz>,
}

impl<Tz> LuaUserData for DateTime<Tz>
where
    Tz: chrono::TimeZone + 'static + From<chrono_tz::Tz>,
    chrono_tz::Tz: From<Tz>,
    Tz::Offset: std::fmt::Display,
{
    fn add_methods<M: LuaUserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(LuaMetaMethod::ToString, |_, this, ()| {
            Ok(this.dt.to_rfc3339())
        });

        methods.add_meta_method(
            LuaMetaMethod::Eq,
            |_, this, other: LuaUserDataRef<DateTime<Tz>>| Ok(this.dt == other.dt),
        );

        methods.add_meta_method(
            LuaMetaMethod::Add,
            |_, this, td: LuaUserDataRef<TimeDelta>| {
                Ok(DateTime {
                    dt: this.dt.clone().checked_add_signed(td.timedelta)
                        .ok_or(mluau::Error::RuntimeError("Overflow in DateTime addition".to_string()))?,
                })
            },
        );

        methods.add_meta_method(
            LuaMetaMethod::Sub,
            |_, this, td: LuaUserDataRef<TimeDelta>| {
                Ok(DateTime {
                    dt: this.dt.clone().checked_sub_signed(td.timedelta)
                        .ok_or(mluau::Error::RuntimeError("Overflow in DateTime subtraction".to_string()))?,
                })
            },
        );

        methods.add_meta_method(
            LuaMetaMethod::Le,
            |_, this, other: LuaUserDataRef<DateTime<Tz>>| Ok(this.dt <= other.dt),
        );

        methods.add_meta_method(
            LuaMetaMethod::Lt,
            |_, this, other: LuaUserDataRef<DateTime<Tz>>| Ok(this.dt < other.dt),
        );

        methods.add_method("with_timezone", |_, this, tz: LuaUserDataRef<Timezone>| {
            Ok(DateTime {
                dt: this.dt.with_timezone(&tz.tz.into()),
            })
        });

        methods.add_method("format", |_, this, format: String| {
            Ok(this.dt.format(&format).to_string())
        });

        methods.add_method(
            "duration_since",
            |_, this, other: LuaUserDataRef<DateTime<Tz>>| {
                Ok(TimeDelta {
                    timedelta: this.dt.clone().signed_duration_since(&other.dt),
                })
            },
        );
    }

    fn add_fields<F: LuaUserDataFields<Self>>(fields: &mut F) {
        fields.add_meta_field(LuaMetaMethod::Type, "DateTime".to_string());

        fields.add_field_method_get("year", |_, this| Ok(this.dt.year()));
        fields.add_field_method_get("month", |_, this| Ok(this.dt.month()));
        fields.add_field_method_get("day", |_, this| Ok(this.dt.day()));
        fields.add_field_method_get("hour", |_, this| Ok(this.dt.hour()));
        fields.add_field_method_get("minute", |_, this| Ok(this.dt.minute()));
        fields.add_field_method_get("second", |_, this| Ok(this.dt.second()));
        fields.add_field_method_get("timestamp_seconds", |_, this| Ok(this.dt.timestamp()));
        fields.add_field_method_get("timestamp_millis", |_, this| Ok(this.dt.timestamp_millis()));
        fields.add_field_method_get("timestamp_micros", |_, this| {
            Ok(this.dt.timestamp_subsec_micros())
        });
        fields.add_field_method_get("timestamp_nanos", |_, this| {
            Ok(this.dt.timestamp_subsec_nanos())
        });
        fields.add_field_method_get("tz", |_, this| {
            Ok(Timezone {
                tz: this.dt.timezone().into(),
            })
        });
        fields.add_field_method_get("base_offset", |_, this| {
            let tz: chrono_tz::Tz = this.dt.timezone().into();

            let td = tz
                .offset_from_utc_datetime(&this.dt.naive_utc())
                .base_utc_offset();

            Ok(TimeDelta { timedelta: td })
        });
        fields.add_field_method_get("dst_offset", |_, this| {
            let tz: chrono_tz::Tz = this.dt.timezone().into();

            let td = tz
                .offset_from_utc_datetime(&this.dt.naive_utc())
                .dst_offset();

            Ok(TimeDelta { timedelta: td })
        });
    }

    fn register(registry: &mut LuaUserDataRegistry<Self>) {
        Self::add_fields(registry);
        Self::add_methods(registry);
        let fields = registry.fields(false).iter().map(|x| x.to_string()).collect::<Vec<_>>();
        registry.add_meta_field("__ud_fields", fields);
    }
}

pub struct Timezone {
    pub tz: chrono_tz::Tz,
}

impl LuaUserData for Timezone {
    fn add_fields<F: LuaUserDataFields<Self>>(fields: &mut F) {
        fields.add_meta_field(LuaMetaMethod::Type, "Timezone".to_string());
        fields.add_field_method_get("name", |_, this| Ok(this.tz.name()));
    }

    fn add_methods<M: LuaUserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(LuaMetaMethod::ToString, |_, this, ()| {
            Ok(this.tz.to_string())
        });

        methods.add_meta_method(
            LuaMetaMethod::Eq,
            |_, this, other: LuaUserDataRef<Timezone>| Ok(this.tz == other.tz),
        );

        // Parses a string to a datetime in the said specific timezone
        methods.add_method("fromString", |_, this, date: String| {
            let dt = date
                .parse::<chrono::DateTime<chrono::FixedOffset>>()
                .map_err(|e| mluau::Error::RuntimeError(format!("Invalid date: {e}")))?;

            Ok(DateTime {
                dt: dt.with_timezone(&this.tz),
            })
        });

        // Translates a timestamp in UTC time to a datetime in the said specific timezone
        methods.add_method(
            "utcToTz",
            |_,
             this,
             (year, month, day, hours, minutes, secs, all): (
                i32,
                u32,
                u32,
                u32,
                u32,
                u32,
                Option<bool>,
            )| {
                match chrono_tz::Tz::UTC.with_ymd_and_hms(year, month, day, hours, minutes, secs) {
                    chrono::LocalResult::Single(ymd_hms) => {
                        let ymd_hms = ymd_hms.with_timezone(&this.tz);
                        Ok((Some(DateTime { dt: ymd_hms }), None))
                    }
                    chrono::LocalResult::Ambiguous(tz, t2) => {
                        if all.unwrap_or(false) {
                            let tz = tz.with_timezone(&this.tz);
                            let t2 = t2.with_timezone(&this.tz);
                            Ok((Some(DateTime { dt: tz }), Some(DateTime { dt: t2 })))
                        } else {
                            let tz = tz.with_timezone(&this.tz);
                            Ok((Some(DateTime { dt: tz }), None))
                        }
                    }
                    chrono::LocalResult::None => {
                        Err(mluau::Error::RuntimeError("Invalid date".to_string()))
                    }
                }
            },
        );

        // Translates a timestamp in the specified timezone to a datetime in UTC
        //
        // Returns a tuple of the first offset and second offset (if the time is ambiguous)
        methods.add_method(
            "tzToUtc",
            |_,
             this,
             (year, month, day, hours, minutes, secs, all): (
                i32,
                u32,
                u32,
                u32,
                u32,
                u32,
                Option<bool>,
            )| {
                match this
                    .tz
                    .with_ymd_and_hms(year, month, day, hours, minutes, secs)
                {
                    chrono::LocalResult::Single(ymd_hms) => {
                        let ymd_hms = ymd_hms.with_timezone(&chrono_tz::Tz::UTC);
                        Ok((Some(DateTime { dt: ymd_hms }), None))
                    }
                    chrono::LocalResult::Ambiguous(tz, t2) => {
                        if all.unwrap_or(false) {
                            let tz = tz.with_timezone(&chrono_tz::Tz::UTC);
                            let t2 = t2.with_timezone(&chrono_tz::Tz::UTC);
                            Ok((Some(DateTime { dt: tz }), Some(DateTime { dt: t2 })))
                        } else {
                            let tz = tz.with_timezone(&chrono_tz::Tz::UTC);
                            Ok((Some(DateTime { dt: tz }), None))
                        }
                    }
                    chrono::LocalResult::None => {
                        Err(mluau::Error::RuntimeError("Invalid date".to_string()))
                    }
                }
            },
        );

        // Translates a time of the current day in UTC time to a datetime in the said specific timezone
        methods.add_method(
            "timeUtcToTz",
            |_, this, (hours, minutes, secs): (u32, u32, u32)| {
                let now = chrono::Utc::now();
                let now = now
                    .with_hour(hours)
                    .ok_or(mluau::Error::RuntimeError("Invalid time".to_string()))?
                    .with_minute(minutes)
                    .ok_or(mluau::Error::RuntimeError("Invalid time".to_string()))?
                    .with_second(secs)
                    .ok_or(mluau::Error::RuntimeError("Invalid time".to_string()))?
                    .with_timezone(&this.tz);
                Ok(DateTime { dt: now })
            },
        );

        // Translates a time of the current day in the said specific timezone to a datetime in UTC
        methods.add_method(
            "timeTzToUtc",
            |_, this, (hours, minutes, secs): (u32, u32, u32)| {
                let now = this.tz.from_utc_datetime(&chrono::Utc::now().naive_utc());
                let now = now
                    .with_hour(hours)
                    .ok_or(mluau::Error::RuntimeError("Invalid time".to_string()))?
                    .with_minute(minutes)
                    .ok_or(mluau::Error::RuntimeError("Invalid time".to_string()))?
                    .with_second(secs)
                    .ok_or(mluau::Error::RuntimeError("Invalid time".to_string()))?
                    .with_timezone(&chrono_tz::Tz::UTC);

                Ok(DateTime { dt: now })
            },
        );

        // Translates the current timestamp to a datetime in the said specific timezone
        methods.add_method("now", |_, this, (): ()| {
            let now = chrono::Utc::now();
            let now = now.with_timezone(&this.tz);
            Ok(DateTime { dt: now })
        });

        // Given a unix time, returns a DateTime object with this timezone
        methods.add_method("fromTime", |_, this, time: I64| {
            let Some(dt) = chrono::DateTime::from_timestamp(time.0, 0) else {
                return Err(mluau::Error::RuntimeError(
                    "Invalid time (might exceed bounds?)".to_string(),
                ));
            };
            let dt = dt.with_timezone(&this.tz);
            Ok(DateTime { dt })
        });

        // Given a unix time in milliseconds, returns a DateTime object with this timezone
        methods.add_method("fromTimeMillis", |_, this, time: I64| {
            let Some(dt) = chrono::DateTime::from_timestamp_millis(time.0) else {
                return Err(mluau::Error::RuntimeError(
                    "Invalid time (might exceed bounds?)".to_string(),
                ));
            };
            let dt = dt.with_timezone(&this.tz);
            Ok(DateTime { dt })
        });

        // Given a unix time in microseconds, returns a DateTime object with this timezone
        methods.add_method("fromTimeMicros", |_, this, time: I64| {
            let Some(dt) = chrono::DateTime::from_timestamp_micros(time.0) else {
                return Err(mluau::Error::RuntimeError(
                    "Invalid time (might exceed bounds?)".to_string(),
                ));
            };
            let dt = dt.with_timezone(&this.tz);
            Ok(DateTime { dt })
        });

        // Given a unix time in nanoseconds, returns a DateTime object with this timezone
        methods.add_method("fromTimeNanos", |_, this, epoch: I64| {
            let dt = chrono::DateTime::from_timestamp_nanos(epoch.0);
            let dt = dt.with_timezone(&this.tz);
            Ok(DateTime { dt })
        });
    }

    fn register(registry: &mut LuaUserDataRegistry<Self>) {
        Self::add_fields(registry);
        Self::add_methods(registry);
        let fields = registry.fields(false).iter().map(|x| x.to_string()).collect::<Vec<_>>();
        registry.add_meta_field("__ud_fields", fields);
    }
}

pub fn init_plugin(lua: &Lua) -> LuaResult<LuaTable> {
    let module = lua.create_table()?;

    module.set(
        "new",
        lua.create_function(|_, tz: String| {
            // Map some common timezones automatically
            match tz.as_str() {
                "UTC" => Ok(Timezone { tz: chrono_tz::UTC }),
                "IST" => Ok(Timezone {
                    tz: chrono_tz::Asia::Kolkata, // Most people in India call it IST though...
                }),
                "PST" | "PDT" => Ok(Timezone {
                    tz: chrono_tz::America::Los_Angeles, // Somehow not included in from_str here?
                }),
                "EDT" => Ok(Timezone {
                    tz: chrono_tz::America::New_York, // Many people use EDT
                }),
                _ => {
                    if let Ok(tz) = chrono_tz::Tz::from_str(&tz) {
                        Ok(Timezone { tz })
                    } else {
                        Err(mluau::Error::RuntimeError("Invalid timezone".to_string()))
                    }
                }
            }
        })?,
    )?;

    // The standard UTC timezone
    module.set("UTC", Timezone { tz: chrono_tz::UTC })?;

    // Creates a new TimeDelta object
    module.set(
        "timedelta_weeks",
        lua.create_function(|_, weeks: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::try_weeks(weeks.0).ok_or(
                    mluau::Error::RuntimeError("Invalid number of weeks".to_string()),
                )?,
            })
        })?,
    )?;

    module.set(
        "timedelta_days",
        lua.create_function(|_, days: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::try_days(days.0).ok_or(mluau::Error::RuntimeError(
                    "Invalid number of days".to_string(),
                ))?,
            })
        })?,
    )?;

    module.set(
        "timedelta_hours",
        lua.create_function(|_, hours: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::try_hours(hours.0).ok_or(
                    mluau::Error::RuntimeError("Invalid number of hours".to_string()),
                )?,
            })
        })?,
    )?;

    module.set(
        "timedelta_minutes",
        lua.create_function(|_, minutes: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::try_minutes(minutes.0).ok_or(
                    mluau::Error::RuntimeError("Invalid number of minutes".to_string()),
                )?,
            })
        })?,
    )?;

    module.set(
        "timedelta_seconds",
        lua.create_function(|_, seconds: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::try_seconds(seconds.0).ok_or(
                    mluau::Error::RuntimeError("Invalid number of seconds".to_string()),
                )?,
            })
        })?,
    )?;

    module.set(
        "timedelta_millis",
        lua.create_function(|_, millis: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::try_milliseconds(millis.0).ok_or(
                    mluau::Error::RuntimeError("Invalid number of milliseconds".to_string()),
                )?,
            })
        })?,
    )?;

    module.set(
        "timedelta_micros",
        lua.create_function(|_, micros: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::microseconds(micros.0),
            })
        })?,
    )?;

    module.set(
        "timedelta_nanos",
        lua.create_function(|_, nanos: I64| {
            Ok(TimeDelta {
                timedelta: chrono::Duration::nanoseconds(nanos.0),
            })
        })?,
    )?;

    module.set_readonly(true); // Block any attempt to modify this table
    Ok(module)
}