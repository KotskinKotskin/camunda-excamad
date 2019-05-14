import store from "@/store/store";

export const roles = [
  "Tester",
  "Analyst",
  "Developer",
  "Admin",
  "Support",
  "Business",
  "All"
];

const CRUD = ["Create", "Read", "Update", "Delete"];
const appearance = ["Show", "Disable", "Hide"];
const resourse = [
  "Migration view",
  "Migration",
  "Process history view",
  "Old Process view",
  "Embedded and share view",
  "Process definition view",
  "Process definition suspend",
  "Job defintion suspend",
  "Process definition start",
  "Process instance terminate",
  "Process instance move token",
  "Process instance send message",
  "Process instance execute job",
  "Process instance view",
  "Decisions view",
  "Decisions deploy view",
  "Incidents view",
  "Incidents rerun view",
  "Live view",
  "Task list view",
  "BPMaS view",
  "Misc view",
  "Search view"
];

const permissions = [
  {
    role: "Tester",
    access: [
      "Migration view",
      "Process history view",
      "Process definition view"
    ],
    deny: ["Migration", "Embedded and share view", "BPMaS view"]
  }
];

export function CheckPermission(resource) {
  var currentRole = store.state.role;
  console.log(currentRole);
  console.log(resource);

  var permissionByRole = permissions.filter(function(el) {
    return el.role === currentRole;
  });

  var access = permissionByRole[0] ? permissionByRole[0].access : null;
  var deny = permissionByRole[0] ? permissionByRole[0].deny : null;

  if (deny) {
    deny.forEach(item => {
      if (resource == item) {
        console.log(resource);
        console.log(item);
        return false;
      }
    });
  }
  if (access) {
    access.forEach(item => {
      if (resource == item) {
        console.log(resource);
        console.log(item);
        return true;
      }
    });
  }
  if (!deny && !access) {
    return false;
  }
}
