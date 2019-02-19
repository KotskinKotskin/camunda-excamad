//use to iframe some url to REPORT in navBar by camundadURL

const Dashboards = [
  {
    camundaUrl: "http://bpmn2.ru/bpmn2/rest/",
    dashboardUrl:
      "http://bpmn2.bpmn2.ru:8080/public/bpmn2/4462baf2-802c-46aa-b21e-a1d9c27ceba4"
  }
];

export function FindDashboardUrl(camundaUrl) {
  return Dashboards.find(x => x.camundaUrl === camundaUrl).dashboardUrl;
}
