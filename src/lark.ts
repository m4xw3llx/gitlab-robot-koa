import _ from "lodash";
import moment from "moment";
import { GitlabEvents, ProjectAnalaysis } from "./eventsModel";
import axios from "axios";

interface LARK_ROBOT_REQUEST {
  url: string;
  body: any;
  success?: () => void;
  fail?: (err: string) => void;
}

const LARK_ROBOTS = {
  TEST_PUSH_BOT:
    "https://open.feishu.cn/open-apis/bot/v2/hook/eee2e54a-bfc8-431a-a8c6-9190ab6a4047",
  NOTI_PUSH_BOT:
    "https://open.feishu.cn/open-apis/bot/v2/hook/3bba1137-657c-42a0-917b-0ec84f6c80d3",
};

export enum LARK_EVENTS {
  SINGLE_PUSH,
  DAILY_ANALAYSIS,
}

// TODO: 没有完善类型， 考虑到之后会迁移为独立的机器人应用， 所以这里先不考虑类型信息
export function getDailyLarkMessageBody(data: ProjectAnalaysis[]) {
  const divs = data.map((item) => {
    // 项目信息
    const { project_name, push_count, operate_users, commits } = item;

    const title = `🧑‍💻 **${project_name}** 共收到 **${push_count}** 次 Push`;

    // 每个用户的提交情况
    const userInfo = operate_users.map((user) => {
      const { author, commit_count } = user;
      const { name } = author;
      const content = `▶️▶️ **${name}** 贡献了 ${commit_count} 个 Commit.`;
      return {
        tag: "div",
        text: {
          content: content,
          tag: "lark_md",
        },
      };
    });

    return [
      {
        tag: "div",
        text: {
          content: title,
          tag: "lark_md",
        },
      },
      ...userInfo,
    ];
  });
  const date = moment().subtract(1, "days").format("YYYY-MM-DD");
  const body = {
    msg_type: "interactive",
    card: {
      config: {
        wide_screen_mode: true,
        enable_forward: true,
      },
      elements: _.flattenDeep(divs),
      header: {
        title: {
          content: `🤖 ${date} 更新汇总`,
          tag: "plain_text",
        },
      },
    },
  };
  return body;
}

function getSinglePushMessage(data: GitlabEvents) {
  const projectName = _.get(data, "project.name");
  const useName = _.get(data, "user_name");
  const title = `🤖检测到 ${projectName} 代码更新 \n\n`;
  const content = `🧑‍💻是 **${useName}** 发起的操作\n\n`;
  const url = _.get(data, "repository.homepage");

  const commits = data.commits.map((el) => {
    return `▶️ ${el.message}\n`;
  });
  const body = {
    msg_type: "interactive",
    card: {
      config: {
        wide_screen_mode: true,
        enable_forward: true,
      },
      elements: [
        {
          tag: "div",
          text: {
            content: commits.join(""),
            tag: "lark_md",
          },
        },
        {
          tag: "div",
          text: {
            content: content,
            tag: "lark_md",
          },
        },
        {
          actions: [
            {
              tag: "button",
              text: {
                content: "点击查看项目 :玫瑰:",
                tag: "lark_md",
              },
              url: url,
              type: "default",
              value: {},
            },
          ],
          tag: "action",
        },
      ],
      header: {
        title: {
          content: title,
          tag: "plain_text",
        },
      },
    },
  };
  return body;
}

// TODO - 待优化
function dealAction<T>(event: LARK_EVENTS, data: T): LARK_ROBOT_REQUEST {
  switch (event) {
    case LARK_EVENTS.SINGLE_PUSH:
      return {
        url: LARK_ROBOTS.NOTI_PUSH_BOT, // FIXME - 测试阶段暂时两个机器人都保留
        body: getSinglePushMessage(data as unknown as GitlabEvents),
      };
    case LARK_EVENTS.DAILY_ANALAYSIS:
      return {
        url: LARK_ROBOTS.NOTI_PUSH_BOT,
        body: getDailyLarkMessageBody(data as unknown as ProjectAnalaysis[]),
      };
  }
}

export async function requestLark<T>(
  event: LARK_EVENTS,
  data: T
): Promise<boolean> {
  const requestData = dealAction(event, data);
  console.log("🚀 ~ file: lark.ts ~ line 158 ~ requestData", requestData);
  return new Promise((resolve) => {
    axios
      .post(requestData.url, requestData.body)
      .then((res) => {
        console.log("🚀 ~ file: lark.ts ~ line 162 ~ .then", res);
        resolve(true);
      })
      .catch((err) => {
        console.log(
          "🚀 ~ file: lark.ts ~ line 166 ~ returnnewPromise ~ err",
          err
        );
        resolve(false);
      });
  });
}
