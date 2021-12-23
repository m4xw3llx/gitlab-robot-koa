import schedule from "node-schedule";
import { LARK_EVENTS, requestLark } from "./lark";
import store from "./store";

function larkSchedule() {
  let rule = new schedule.RecurrenceRule();
  rule.hour = 9;
  rule.minute = 0;
  rule.second = 0;
  rule.tz = "Asia/Shanghai";

  const job = schedule.scheduleJob(rule, async () => {
    const projectData = store.getCurrentProjectData();
    if (projectData.length > 0) {
      const result = await requestLark(
        LARK_EVENTS.DAILY_ANALAYSIS,
        projectData
      );
      if (result) {
        store.clean();
      }
    }
  });
  return job;
}

export default larkSchedule;
