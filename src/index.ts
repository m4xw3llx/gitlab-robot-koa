import Koa from "koa";
import Router from "koa-router";

import logger from "koa-logger";
import json from "koa-json";
import bodyParser from "koa-bodyparser";

import { gitlabEvents, updateGitlabEvents } from "./events";
import larkSchedule from "./schedule";
import _ from "lodash";

const app = new Koa();
const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.body = "Hello Koa";
  await next();
});

router.get("/gitlab", gitlabEvents);
router.post("/gitlab", updateGitlabEvents);

app.use(logger());
app.use(json());
app.use(bodyParser());

larkSchedule();

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
