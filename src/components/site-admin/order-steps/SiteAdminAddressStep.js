"use client";

import CustomerAddressStep from "@/components/customer/order-steps/CustomerAddressStep";

// This is a wrapper that makes location details optional for site admin
export default function SiteAdminAddressStep({ formData, setFormData }) {
	// Pass through to CustomerAddressStep but with relaxed validation
	// The validation will be handled in the parent modal
	return <CustomerAddressStep formData={formData} setFormData={setFormData} validationErrors={{}} />;
}
