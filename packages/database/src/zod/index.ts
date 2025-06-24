import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','email','emailVerified','image','createdAt','updatedAt','username','role','banned','banReason','banExpires','onboardingComplete','paymentsCustomerId','locale']);

export const SessionScalarFieldEnumSchema = z.enum(['id','expiresAt','ipAddress','userAgent','userId','impersonatedBy','activeOrganizationId','token','createdAt','updatedAt']);

export const AccountScalarFieldEnumSchema = z.enum(['id','accountId','providerId','userId','accessToken','refreshToken','idToken','expiresAt','password','accessTokenExpiresAt','refreshTokenExpiresAt','scope','createdAt','updatedAt']);

export const VerificationScalarFieldEnumSchema = z.enum(['id','identifier','value','expiresAt','createdAt','updatedAt']);

export const PasskeyScalarFieldEnumSchema = z.enum(['id','name','publicKey','userId','credentialID','counter','deviceType','backedUp','transports','createdAt']);

export const OrganizationScalarFieldEnumSchema = z.enum(['id','name','slug','logo','createdAt','metadata','paymentsCustomerId']);

export const MemberScalarFieldEnumSchema = z.enum(['id','organizationId','userId','role','createdAt']);

export const InvitationScalarFieldEnumSchema = z.enum(['id','organizationId','email','role','status','expiresAt','inviterId']);

export const PurchaseScalarFieldEnumSchema = z.enum(['id','organizationId','userId','type','customerId','subscriptionId','productId','status','createdAt','updatedAt']);

export const AiChatScalarFieldEnumSchema = z.enum(['id','organizationId','userId','title','messages','createdAt','updatedAt']);

export const TemplateScalarFieldEnumSchema = z.enum(['id','name','description','createdAt','updatedAt','isActive','userId','logo_path','logo_footer','color','font_title','font_paragraph']);

export const TemplateRevisionScalarFieldEnumSchema = z.enum(['id','templateId','userId','name','description','createdAt','logo_path','logo_footer','color','font_title','font_paragraph','version']);

export const ManualScalarFieldEnumSchema = z.enum(['id','userId','templateId','contentIt','contentFr','contentDe','contentEn','contentEs','version','name','createdAt','updatedAt','pagesInput','pagesOutput','images','pdf','docx','pdf_it','pdf_fr','pdf_de','pdf_en','pdf_es','docx_it','docx_fr','docx_de','docx_en','docx_es','isActive']);

export const ManualVersionScalarFieldEnumSchema = z.enum(['id','manualId','userId','templateId','contentIt','contentFr','contentDe','contentEn','contentEs','version','name','createdAt','pagesInput','pagesOutput','images','pdf','docx','pdf_it','pdf_fr','pdf_de','pdf_en','pdf_es','docx_it','docx_fr','docx_de','docx_en','docx_es']);

export const ManualInstructionScalarFieldEnumSchema = z.enum(['id','file_path','prompt','createdAt','updatedAt']);

export const SectionsManualScalarFieldEnumSchema = z.enum(['id','name','createdAt','updatedAt']);

export const SectionCardScalarFieldEnumSchema = z.enum(['id','sectionId','title','description','createdAt','updatedAt']);

export const IconeScalarFieldEnumSchema = z.enum(['id','nome','descrizione','urlicona','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const PurchaseTypeSchema = z.enum(['SUBSCRIPTION','ONE_TIME']);

export type PurchaseTypeType = `${z.infer<typeof PurchaseTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().nullable(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.coerce.date().nullable(),
  onboardingComplete: z.boolean(),
  paymentsCustomerId: z.string().nullable(),
  locale: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().nullable(),
  activeOrganizationId: z.string().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  idToken: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  password: z.string().nullable(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
  scope: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// VERIFICATION SCHEMA
/////////////////////////////////////////

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
})

export type Verification = z.infer<typeof VerificationSchema>

/////////////////////////////////////////
// PASSKEY SCHEMA
/////////////////////////////////////////

export const PasskeySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
})

export type Passkey = z.infer<typeof PasskeySchema>

/////////////////////////////////////////
// ORGANIZATION SCHEMA
/////////////////////////////////////////

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().nullable(),
  paymentsCustomerId: z.string().nullable(),
})

export type Organization = z.infer<typeof OrganizationSchema>

/////////////////////////////////////////
// MEMBER SCHEMA
/////////////////////////////////////////

export const MemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date(),
})

export type Member = z.infer<typeof MemberSchema>

/////////////////////////////////////////
// INVITATION SCHEMA
/////////////////////////////////////////

export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string(),
})

export type Invitation = z.infer<typeof InvitationSchema>

/////////////////////////////////////////
// PURCHASE SCHEMA
/////////////////////////////////////////

export const PurchaseSchema = z.object({
  type: PurchaseTypeSchema,
  id: z.string().cuid(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  customerId: z.string(),
  subscriptionId: z.string().nullable(),
  productId: z.string(),
  status: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Purchase = z.infer<typeof PurchaseSchema>

/////////////////////////////////////////
// AI CHAT SCHEMA
/////////////////////////////////////////

export const AiChatSchema = z.object({
  id: z.string().cuid(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  title: z.string().nullable(),
  messages: JsonValueSchema.array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AiChat = z.infer<typeof AiChatSchema>

/////////////////////////////////////////
// TEMPLATE SCHEMA
/////////////////////////////////////////

export const TemplateSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isActive: z.boolean(),
  userId: z.string(),
  logo_path: z.string().nullable(),
  logo_footer: z.string().nullable(),
  color: z.string(),
  font_title: z.string(),
  font_paragraph: z.string(),
})

export type Template = z.infer<typeof TemplateSchema>

/////////////////////////////////////////
// TEMPLATE REVISION SCHEMA
/////////////////////////////////////////

export const TemplateRevisionSchema = z.object({
  id: z.number().int(),
  templateId: z.number().int(),
  userId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  logo_path: z.string().nullable(),
  logo_footer: z.string().nullable(),
  color: z.string(),
  font_title: z.string(),
  font_paragraph: z.string(),
  version: z.number().int(),
})

export type TemplateRevision = z.infer<typeof TemplateRevisionSchema>

/////////////////////////////////////////
// MANUAL SCHEMA
/////////////////////////////////////////

export const ManualSchema = z.object({
  id: z.number().int(),
  userId: z.string(),
  templateId: z.number().int().nullable(),
  contentIt: JsonValueSchema.nullable(),
  contentFr: JsonValueSchema.nullable(),
  contentDe: JsonValueSchema.nullable(),
  contentEn: JsonValueSchema.nullable(),
  contentEs: JsonValueSchema.nullable(),
  version: z.number(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  pagesInput: z.number().int().nullable(),
  pagesOutput: z.number().int().nullable(),
  images: JsonValueSchema.nullable(),
  pdf: z.string().nullable(),
  docx: z.string().nullable(),
  pdf_it: z.string().nullable(),
  pdf_fr: z.string().nullable(),
  pdf_de: z.string().nullable(),
  pdf_en: z.string().nullable(),
  pdf_es: z.string().nullable(),
  docx_it: z.string().nullable(),
  docx_fr: z.string().nullable(),
  docx_de: z.string().nullable(),
  docx_en: z.string().nullable(),
  docx_es: z.string().nullable(),
  isActive: z.boolean(),
})

export type Manual = z.infer<typeof ManualSchema>

/////////////////////////////////////////
// MANUAL VERSION SCHEMA
/////////////////////////////////////////

export const ManualVersionSchema = z.object({
  id: z.number().int(),
  manualId: z.number().int(),
  userId: z.string(),
  templateId: z.number().int().nullable(),
  contentIt: JsonValueSchema.nullable(),
  contentFr: JsonValueSchema.nullable(),
  contentDe: JsonValueSchema.nullable(),
  contentEn: JsonValueSchema.nullable(),
  contentEs: JsonValueSchema.nullable(),
  version: z.number(),
  name: z.string(),
  createdAt: z.coerce.date(),
  pagesInput: z.number().int().nullable(),
  pagesOutput: z.number().int().nullable(),
  images: JsonValueSchema.nullable(),
  pdf: z.string().nullable(),
  docx: z.string().nullable(),
  pdf_it: z.string().nullable(),
  pdf_fr: z.string().nullable(),
  pdf_de: z.string().nullable(),
  pdf_en: z.string().nullable(),
  pdf_es: z.string().nullable(),
  docx_it: z.string().nullable(),
  docx_fr: z.string().nullable(),
  docx_de: z.string().nullable(),
  docx_en: z.string().nullable(),
  docx_es: z.string().nullable(),
})

export type ManualVersion = z.infer<typeof ManualVersionSchema>

/////////////////////////////////////////
// MANUAL INSTRUCTION SCHEMA
/////////////////////////////////////////

export const ManualInstructionSchema = z.object({
  id: z.number().int(),
  file_path: z.string(),
  prompt: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ManualInstruction = z.infer<typeof ManualInstructionSchema>

/////////////////////////////////////////
// SECTIONS MANUAL SCHEMA
/////////////////////////////////////////

export const SectionsManualSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SectionsManual = z.infer<typeof SectionsManualSchema>

/////////////////////////////////////////
// SECTION CARD SCHEMA
/////////////////////////////////////////

export const SectionCardSchema = z.object({
  id: z.number().int(),
  sectionId: z.number().int(),
  title: z.string(),
  description: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SectionCard = z.infer<typeof SectionCardSchema>

/////////////////////////////////////////
// ICONE SCHEMA
/////////////////////////////////////////

export const IconeSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  descrizione: z.string().nullable(),
  urlicona: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Icone = z.infer<typeof IconeSchema>
