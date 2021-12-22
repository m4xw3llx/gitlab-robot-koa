import {
  ProjectAnalaysis,
  UserAnalaysis,
  GitlabEvents,
  Commit,
} from "./eventsModel";
import _ from "lodash";

let kvStore: { [key: number]: GitlabEvents[] } = {};

function update(value: GitlabEvents): boolean {
  const projectId = _.get(value, "project.id");
  if (!projectId) {
    return false;
  }
  if (kvStore[projectId]) {
    kvStore[projectId] = [...kvStore[projectId], value];
  } else {
    kvStore[projectId] = [value];
  }
  return true;
}

function clean() {
  kvStore = {};
}

function getCommitsAuthorData(commits: Commit[]): UserAnalaysis[] {
  return commits.reduce((sum: UserAnalaysis[], current: Commit) => {
    const author = current.author;
    const authorName = author.name;
    const authorData = sum.find((item) => item.author.name == authorName);
    if (authorData) {
      authorData.commit_count++;
    } else {
      sum.push({
        author,
        commit_count: 1,
      });
    }
    return sum;
  }, []);
}

function getAllCommits(): GitlabEvents[] {
  return Object.keys(kvStore).reduce((sum: GitlabEvents[], current: string) => {
    const id = Number(current);
    const currentProjectEvents = kvStore[id];
    const currentProjectCommits = currentProjectEvents.reduce(
      (commits, project) => {
        return [...commits, ...project.commits];
      },
      []
    );
    return sum.concat(currentProjectCommits);
  }, []);
}

function getCurrentProjectData(): ProjectAnalaysis[] {
  const result = Object.keys(kvStore).reduce(
    (sum: ProjectAnalaysis[], current: string) => {
      const id = Number(current);
      const currentProjectEvents = kvStore[id];

      const commits = currentProjectEvents.reduce((commits, project) => {
        return [...commits, ...project.commits];
      }, []);

      const currentProjectAnalaysis: ProjectAnalaysis = {
        project_id: id,
        project_name: currentProjectEvents[0].project.name,
        push_count: currentProjectEvents.length,
        operate_users: getCommitsAuthorData(commits),
        commits,
      };
      return sum.concat(currentProjectAnalaysis);
    },
    []
  );
  console.log(
    "🚀 ~ file: store.ts ~ line 82 ~ getCurrentProjectData ~ result",
    result
  );
  return result;
}

export default { update, getCurrentProjectData, getAllCommits, clean };
