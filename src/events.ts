import { GitlabEvents } from "./eventsModel";
import _ from "lodash";
import store from "./store";
import { LARK_EVENTS, requestLark } from "./lark";

const updateGitlabEvents = async (ctx: any, next: any) => {
  const data = <GitlabEvents>ctx.request.body;
  const header = ctx.request.header;
  const events = _.get(header, "x-gitlab-event", "");
  const result = events == "Push Hook" ? store.update(data) : false;
  const larkResult = await requestLark(LARK_EVENTS.SINGLE_PUSH, data);
  ctx.body = {
    lark: larkResult,
    store: result,
  };
  await next();
};

const gitlabEvents = async (ctx: any, next: any) => {
  const localEvents = store.getCurrentProjectData();
  ctx.body = localEvents;
  await next();
};
export { updateGitlabEvents, gitlabEvents };
