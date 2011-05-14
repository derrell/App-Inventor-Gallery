/*
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.google.appengine.demos.taskengine.server;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.demos.taskengine.client.TasksApi;
import com.google.appengine.demos.taskengine.shared.Task;
import com.google.gwt.user.server.rpc.RemoteServiceServlet;

import java.util.HashMap;
import java.util.List;

import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;
import javax.jdo.Query;
import javax.jdo.Transaction;

/**
 * Implementation of Tasks API.
 */
@SuppressWarnings("serial")
public class TasksApiImpl extends RemoteServiceServlet implements TasksApi {
  private final PersistenceManagerFactory pmf =
    JDOHelper.getPersistenceManagerFactory("transactions-optional");

  public String deleteTasks(String[] tasksToDelete) {
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();
    String lastTaskDeletedId = null;
    String email = null;
    if (user != null) {
      email = user.getEmail();
      PersistenceManager pm = pmf.getPersistenceManager();
      List<Task> tasks = getPersistedTasksForUser(email, pm);

      // AppEngine datastore does not allow multiple conditional operators. So
      // we need to select all tasks for this user and then do our own hash
      // join.
      HashMap<String, Task> managedTaskHash = new HashMap<String, Task>();
      for (int i = 0; i < tasks.size(); i++) {
        Task task = tasks.get(i);
        managedTaskHash.put(task.getId(), task);
      }

      // Delete the tasks we need to delete.
      for (int i = 0; i < tasksToDelete.length; i++) {
        String idOfTaskToDelete = tasksToDelete[i];
        Object toDelete = managedTaskHash.get(idOfTaskToDelete);
        if (toDelete != null) {
          pm.deletePersistent(toDelete);
          // We want to return at least one non-null String Id as a weak
          // indication that the deletes happened.
          lastTaskDeletedId = idOfTaskToDelete;
        }
      }

      pm.close();
    }

    return lastTaskDeletedId;
  }

  public String getLoginUrl() {
    UserService userService = UserServiceFactory.getUserService();
    return userService.createLoginURL(getAppUrl());
  }

  public Task[] getTaskList() {
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();

    String email = null;
    if (user != null) {
      email = user.getEmail();

      PersistenceManager pm = pmf.getPersistenceManager();
      List<Task> detachedTasks = null;

      List<Task> persistedTasks = getPersistedTasksForUser(email, pm);

      detachedTasks = (List<Task>) pm.detachCopyAll(persistedTasks);
      pm.close();

      // This pattern is not the cleanest. But so that we don't have to create
      // another GWT serializable wrapper type, we reuse the TaskData type and
      // simply special case the first entry in the returned array to have
      // meta data about the logged in user.
      Task metaTask = new Task();
      metaTask.setEmail(email);
      metaTask.setDetails(userService.createLogoutURL(
        userService.createLoginURL(getAppUrl())));
      detachedTasks.add(0, metaTask);
      return detachedTasks.toArray(new Task[0]);
    } else {
      return null;
    }
  }

  public String persistTask(Task task) {
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();
    String email = null;

    if (user != null) {
      email = user.getEmail();
      task.setEmail(email);
      if (task.getId() == null) {
        // We are adding a new Task to the data store
        return persistNewTask(task);
      } else {
        // We need to update an existing record
        return updateExistingTask(task);
      }
    }

    // User not logged in
    return null;
  }

  private String getAppUrl() {
    String servletUrl = getThreadLocalRequest().getRequestURL().toString();
    String resourcePath = getThreadLocalRequest().getRequestURI();
    return servletUrl.replace(resourcePath, "");
  }

  @SuppressWarnings("unchecked")
  private List<Task> getPersistedTasksForUser(String email,
      PersistenceManager pm) {
    Query q = pm.newQuery(Task.class, "email == email_address");
    q.declareParameters("java.lang.String email_address");
    List<Task> persistedTasks = (List<Task>) q.execute(email);
    return persistedTasks;
  }

  private String persistNewTask(Task newTask) {
    PersistenceManager pm = pmf.getPersistenceManager();
    pm.makePersistent(newTask);
    pm.close();
    return newTask.getId();
  }

  private String updateExistingTask(Task existingTask) {
    String taskId = null;
    PersistenceManager pm = pmf.getPersistenceManager();
    Transaction tx = pm.currentTransaction();
    try {
      tx.begin();
      Task managedTask = (Task) pm.getObjectById(Task.class,
          existingTask.getId());
      if (managedTask != null) {
        managedTask.setEmail(existingTask.getEmail());
        managedTask.setTitle(existingTask.getTitle());
        managedTask.setDetails(existingTask.getDetails());
        managedTask.setFinished(existingTask.isFinished());
        managedTask.setLabelPriority(existingTask.getLabelPriority());
        taskId = managedTask.getId();
      }
      tx.commit();
    } catch (Exception e) {
      if (tx.isActive()) {
        tx.rollback();
      }
    } finally {
      pm.close();
    }
    return taskId;
  }
}
