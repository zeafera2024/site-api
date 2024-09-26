const moment = require("moment-timezone");

const getDataTime = () => {
  const timezone = "America/Fortaleza";
  const now = moment().tz(timezone);
  const today = now.clone().format("YYYY-MM-DD");
  const timezoneRegion = moment.tz.guess();

  return {
    today,
    timezoneRegion,
  };
};

const convertDataTimeMatch = (datatime, timezone) => {
  const serverMoment = moment.parseZone(datatime);
  const convertedMoment = serverMoment.clone().tz(timezone);
  const adjustedMoment = convertedMoment.clone().subtract(3, "hours");
  const adjustedTime = adjustedMoment.format("YYYY-MM-DDTHH:mm:ssZ");

  return adjustedTime;
};

module.exports = {
  getDataTime,
  convertDataTimeMatch,
};
