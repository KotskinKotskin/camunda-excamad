const REST_ENDPOINT = "rest";
const ENVORTMENT_PREFIX = [
  {
    name: "prod",
    url: "cloud.bpmn2.ru"
  },
  {
    name: "dev",
    url: "cloud-dev.bpmn2.ru"
  },
  {
    name: "test",
    url: "cloud-test.bpmn2.ru"
  }
];
const CAMUNDA_PROJECT = [
  "terminal",
  "ribus",
  "seor",
  "manananer"
];

export function generatePossibleUrl() {
  var arrayOfPossibleUlr = [];

  CAMUNDA_PROJECT.forEach(project => {
    ENVORTMENT_PREFIX.forEach(envorment => {
      var url =
        "http://" + envorment.url + "/" + project + "/" + REST_ENDPOINT + "/";
      arrayOfPossibleUlr.push(url);
    });
  });
  return arrayOfPossibleUlr;
}
