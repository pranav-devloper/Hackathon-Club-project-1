import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

// Users table (Production authentication & credential storage)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Behavior Events table (High-write-volume analytics & tracking)
export const userEvents = pgTable('user_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // e.g. 'page_view', 'click', 'search', 'feature_usage', 'session_start'
  eventName: text('event_name').notNull(), // e.g. 'view_dashboard', 'click_button', 'search_products'
  pagePath: text('page_path'),
  metadata: jsonb('metadata'), // JSON/JSONB metadata (sanitized, no PII/secrets)
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_events_user_id_idx').on(table.userId),
  eventTypeIdx: index('user_events_event_type_idx').on(table.eventType),
  createdAtIdx: index('user_events_created_at_idx').on(table.createdAt),
}));

// Products / Stock Ledger table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull().default('RAW_MATERIAL'),
  unitCost: doublePrecision('unit_cost').notNull().default(0),
  unit: text('unit').notNull().default('Unit'),
  onHand: doublePrecision('on_hand').notNull().default(0),
  freeToUse: doublePrecision('free_to_use').notNull().default(0),
  incoming: doublePrecision('incoming').notNull().default(0),
  outgoing: doublePrecision('outgoing').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Work Centers table
export const workCenters = pgTable('work_centers', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  costPerHour: doublePrecision('cost_per_hour').notNull().default(0),
  capacity: integer('capacity').notNull().default(100),
  status: text('status').notNull().default('OPERATIONAL'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bills of Materials (BOM) master
export const boms = pgTable('boms', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: doublePrecision('quantity').notNull().default(1),
  reference: text('reference'),
  createdAt: timestamp('created_at').defaultNow(),
});

// BOM Raw Components
export const bomComponents = pgTable('bom_components', {
  id: serial('id').primaryKey(),
  bomId: integer('bom_id').notNull().references(() => boms.id, { onDelete: 'cascade' }),
  componentProductId: integer('component_product_id').notNull().references(() => products.id),
  quantity: doublePrecision('quantity').notNull().default(1),
});

// BOM Operations / Work Orders configuration
export const bomOperations = pgTable('bom_operations', {
  id: serial('id').primaryKey(),
  bomId: integer('bom_id').notNull().references(() => boms.id, { onDelete: 'cascade' }),
  operationName: text('operation_name').notNull(),
  workCenterId: integer('work_center_id').notNull().references(() => workCenters.id),
  expectedDuration: doublePrecision('expected_duration').notNull().default(0),
});

// Manufacturing Orders (MO)
export const manufacturingOrders = pgTable('manufacturing_orders', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  finishedProductId: integer('finished_product_id').notNull().references(() => products.id),
  bomId: integer('bom_id').references(() => boms.id),
  quantity: doublePrecision('quantity').notNull().default(1),
  unit: text('unit').notNull().default('Unit'),
  scheduleDate: text('schedule_date'),
  assignee: text('assignee'),
  status: text('status').notNull().default('Draft'),
  createdAt: timestamp('created_at').defaultNow(),
});

// MO Components consumed
export const moComponents = pgTable('mo_components', {
  id: serial('id').primaryKey(),
  moId: integer('mo_id').notNull().references(() => manufacturingOrders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  toConsume: doublePrecision('to_consume').notNull().default(0),
  consumed: doublePrecision('consumed').notNull().default(0),
  availability: text('availability').notNull().default('Available'),
});

// Work Orders (WO) created for MOs
export const workOrders = pgTable('work_orders', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  moId: integer('mo_id').notNull().references(() => manufacturingOrders.id, { onDelete: 'cascade' }),
  operation: text('operation').notNull(),
  workCenterId: integer('work_center_id').notNull().references(() => workCenters.id),
  expectedDuration: doublePrecision('expected_duration').notNull().default(0),
  realDuration: doublePrecision('real_duration').notNull().default(0),
  status: text('status').notNull().default('To Do'),
  startedAt: timestamp('started_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const productsRelations = relations(products, ({ many }) => ({
  boms: many(boms),
  moFinished: many(manufacturingOrders),
}));

export const bomsRelations = relations(boms, ({ one, many }) => ({
  product: one(products, {
    fields: [boms.productId],
    references: [products.id],
  }),
  components: many(bomComponents),
  operations: many(bomOperations),
}));

export const bomComponentsRelations = relations(bomComponents, ({ one }) => ({
  bom: one(boms, {
    fields: [bomComponents.bomId],
    references: [boms.id],
  }),
  product: one(products, {
    fields: [bomComponents.componentProductId],
    references: [products.id],
  }),
}));

export const bomOperationsRelations = relations(bomOperations, ({ one }) => ({
  bom: one(boms, {
    fields: [bomOperations.bomId],
    references: [boms.id],
  }),
  workCenter: one(workCenters, {
    fields: [bomOperations.workCenterId],
    references: [workCenters.id],
  }),
}));

export const manufacturingOrdersRelations = relations(manufacturingOrders, ({ one, many }) => ({
  finishedProduct: one(products, {
    fields: [manufacturingOrders.finishedProductId],
    references: [products.id],
  }),
  bom: one(boms, {
    fields: [manufacturingOrders.bomId],
    references: [boms.id],
  }),
  components: many(moComponents),
  workOrders: many(workOrders),
}));

export const moComponentsRelations = relations(moComponents, ({ one }) => ({
  mo: one(manufacturingOrders, {
    fields: [moComponents.moId],
    references: [manufacturingOrders.id],
  }),
  product: one(products, {
    fields: [moComponents.productId],
    references: [products.id],
  }),
}));

export const workOrdersRelations = relations(workOrders, ({ one }) => ({
  mo: one(manufacturingOrders, {
    fields: [workOrders.moId],
    references: [manufacturingOrders.id],
  }),
  workCenter: one(workCenters, {
    fields: [workOrders.workCenterId],
    references: [workCenters.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  events: many(userEvents),
}));

export const userEventsRelations = relations(userEvents, ({ one }) => ({
  user: one(users, {
    fields: [userEvents.userId],
    references: [users.id],
  }),
}));
