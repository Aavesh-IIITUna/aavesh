import { Router } from 'express';
import {
  getSociety,
  getTracks,
  listProjects,
  listMembers,
} from '../controllers/societyController.js';
import { createMessage, listMessages } from '../controllers/contactController.js';
import { createAuthRouter } from './authRoutes.js';
import { createOptionalAuth, createRequireAuth } from '../middleware/requireAuth.js';
import { createRequirePermission, PERMISSIONS } from '../middleware/permissions.js';
import { createRoleHandlers } from '../controllers/roleController.js';
import { createProfileHandlers } from '../controllers/profileController.js';
import { createMemberAdminHandlers } from '../controllers/memberAdminController.js';
import { createEventHandlers } from '../controllers/eventController.js';

export const createApiRouter = (db) => {
  const router = Router();
  const requireAuth = createRequireAuth(db);
  const optionalAuth = createOptionalAuth(db);
  const requirePermission = (permission) => createRequirePermission(db, permission);
  const authRoutes = createAuthRouter(db);
  const roleHandlers = createRoleHandlers(db);
  const profileHandlers = createProfileHandlers(db);
  const memberHandlers = createMemberAdminHandlers(db);
  const eventHandlers = createEventHandlers(db);

  router.use('/auth', authRoutes);

  router.get('/me', requireAuth, profileHandlers.getProfile);
  router.patch('/me/profile', requireAuth, profileHandlers.updateProfile);

  router.post('/roles', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE), roleHandlers.createRole);
  router.get('/roles', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE), roleHandlers.listRoles);
  router.patch('/roles/:roleKey', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE), roleHandlers.updateRole);
  router.get('/users', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE), roleHandlers.listUsers);
  router.patch('/users/:userId/roles', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE), roleHandlers.changeUserRoles);
  router.patch('/users/:userId/permissions', requireAuth, requirePermission(PERMISSIONS.ROLES_MANAGE), roleHandlers.changeUserPermissions);

  router.get('/society', getSociety);
  router.get('/society/tracks', getTracks);
  router.get('/projects', listProjects);
  router.get('/members', listMembers);
  router.get('/manage/members', requireAuth, requirePermission(PERMISSIONS.MEMBERS_MANAGE), memberHandlers.listManagedMembers);
  router.post('/members', requireAuth, requirePermission(PERMISSIONS.MEMBERS_MANAGE), memberHandlers.createMember);
  router.patch('/members/:id', requireAuth, requirePermission(PERMISSIONS.MEMBERS_MANAGE), memberHandlers.updateMember);
  router.delete('/members/:id', requireAuth, requirePermission(PERMISSIONS.MEMBERS_MANAGE), memberHandlers.deleteMember);

  router.get('/events', optionalAuth, eventHandlers.listEvents);
  router.get('/events/:id', optionalAuth, eventHandlers.getEvent);
  router.post('/events', requireAuth, requirePermission(PERMISSIONS.EVENTS_MANAGE), eventHandlers.createEvent);
  router.patch('/events/:id', requireAuth, requirePermission(PERMISSIONS.EVENTS_MANAGE), eventHandlers.updateEvent);
  router.delete('/events/:id', requireAuth, requirePermission(PERMISSIONS.EVENTS_MANAGE), eventHandlers.deleteEvent);

  router.post('/contact', createMessage);
  router.get('/contact', requireAuth, requirePermission(PERMISSIONS.CONTACTS_READ), listMessages);

  return router;
};

export default createApiRouter();
