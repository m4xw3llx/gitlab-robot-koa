import _ from "lodash";
import moment from "moment";
import { ProjectAnalaysis } from "./eventsModel";
import axios from "axios";

const LARK_ROBOT = {
  TEST_PUSH_BOT:
    "https://open.feishu.cn/open-apis/bot/v2/hook/eee2e54a-bfc8-431a-a8c6-9190ab6a4047",
  NOTI_PUSH_BOT:
    "https://open.feishu.cn/open-apis/bot/v2/hook/3bba1137-657c-42a0-917b-0ec84f6c80d3",
};

// TODO: 没有完善类型， 考虑到之后会迁移为独立的机器人应用， 所以这里先不考虑类型信息
export function getLarkMessageBody(data: ProjectAnalaysis[]) {
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

export async function requestLark(data: ProjectAnalaysis[]) {
  const body = getLarkMessageBody(data);
  return new Promise((resolve) => {
    axios
      .post(LARK_ROBOT.TEST_PUSH_BOT, body)
      .then((res) => {
        console.log("🚀 ~ file: lark.ts ~ line 61 ~ .then ~ res", res);
        resolve(true);
      })
      .catch((err) => {
        console.log(
          "🚀 ~ file: lark.ts ~ line 64 ~ returnnewPromise ~ err",
          err
        );
        resolve(false);
      });
  });
}
