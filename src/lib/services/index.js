/**
 * Super Admin Services Barrel Export
 * Convenient imports for all super admin services
 * 
 * Usage:
 * import { userService, orderService, companyService } from "@/lib/services";
 * // or
 * import { userService } from "@/lib/services/superAdminService";
 * import { transformUser } from "@/lib/services/superAdminTransformers";
 */

export {
	userService,
	orderService,
	companyService,
	default as allServices,
} from "./superAdminService";

export {
	// User transformers
	transformUser,
	transformUsers,
	// Order transformers
	transformOrder,
	transformOrders,
	// Company transformers
	transformCompany,
	transformCompanies,
	// Utility functions
	extractArrayData,
	extractSingleData,
	default as allTransformers,
} from "./superAdminTransformers";
