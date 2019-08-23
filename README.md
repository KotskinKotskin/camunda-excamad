# Excamad

**Ex**ternal **cam**unda **ad**min portal. Make life in **multi-camunda`s** environment much easy and provide some cool features.
License : GNU GPLv3.

DEMO: https://cadmin.bpmn2.ru (dont forget about CORS)

# 0. How to run

a) ---make excamad---

- git clone
- npm install
- fill src/config/settings.js with own value
- npm run serve (start dev server) OR
- npm run build (produce html,js,css in to /dist/)

b) --prepair camunda--

- For stand-alone camunda : http://beninkster.com/tomcat-7-and-disabling-cors
- For embedded camunda: https://forum.camunda.org/t/camunda-cors-filter-in-spring-boot-application/5494

## OR

```
     docker run -d -p 80:80 kotovdenis/excamad:latest
```

# 1. Features

## Processes

- Online statistics about active and ended processes
- Migration tool
- Batch variables editor
- Search instances in history by ID and variables
- Old activity report
- Browser viewer and modeler for deployed processes
- Jira integration (fetch issue about activities from jira)

## Decisions

- Online statistics
- Decisions viewer and modeler
- Bitbucket integration
- Deploy from browser

## Incidents

- Batch rerun activities
- Fix selected activities
- Delete failed instances

## Live

Provide facebook-like feed about activities in system.

## Tasklist

Simple forms and form generator. You need extend your Camunda rest api with method **/taskfields**

    //example
        @Path("/")
    public ctaskfieldslass TaskFieldsService {


        @GET
     @Produces(MediaType.APPLICATION_JSON)
        @Path("{taskId}")
        public String getFormFieldList(@Context HttpHeaders httpHeaders,
        @PathParam("taskId") String taskId) {
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        FormService formService = processEngine.getFormService();
        TaskFormData taskFormData = formService.getTaskFormData(taskId);
        List<FormField> formFieldList = taskFormData.getFormFields();
        System.out.println("Strike");
        String json = JSON(formFieldList).toString();
        return json;
    }

}

## Business process as service

Organize camunda as provider of BPMN processes.

## Multi-camunda`s

Easy switch server and envorments.

## Login

Ready login provider for basic auth and passthrough to Jira and Bitbucket.

# 2. Access to server

Excamad is servless app - all api calls made from your browser. You need host produced files (/dist) on some web-server. And you need enable CORS on your`s camunda.

- For stand-alone camunda : http://beninkster.com/tomcat-7-and-disabling-cors
- For embedded camunda: https://forum.camunda.org/t/camunda-cors-filter-in-spring-boot-application/5494
- You can use reverse-proxy: https://www.npmjs.com/package/cors-anywhere
- You can host files on camunda host.

# 3. Install

    npm insall
    -
    npm run build  // produce files in dist/
    OR
    npm run serve  // start develop server

You need write global variables in **seetings.js** and **camundasUrl.js**. Don`t foget turn on "Expert mode" in "Systems" to enable danger commands.
