import schedule from "node-schedule";
import { LARK_EVENTS, requestLark } from "./lark";
import store from "./store";

function larkSchedule() {
  const job = schedule.scheduleJob("0 9 * * *", async () => {
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
