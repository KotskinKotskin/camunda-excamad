export const defaultGroups = [
  'excamad-start-process',
  'excamad-migrate-process-definition',
  'excamad-edit-decsion-definition',
  'excamad-rerun-incidents',
  'excamad-terminate-instance',
  'excamad-suspend-batch',
  'excamad-delete-batch',
  'excamad-suspend-process-definition',
  'excamad-suspend-job-definition',
  'excamad-suspend-process-instance',
  'excamad-suspend-job-process-instance',
  'excamad-move-token',
  'excamad-send-message',
  'excamad-edit-variable'
];

export function checkRoles(login, action) {
  if (defaultSuperAdminLogins.indexOf(login) != -1) {
    return true;
  } else if (login.camundaProfile.groups.indexOf(action) != -1) {
    return true;
  } else return false;
}
