"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { companyAdminApi } from "@/lib/api";

export default function CustomerEmailStep({
  formData,
  setFormData,
  onEmailValid,
  onCreateUserClick,
}) {
  const { t } = useTranslation();

  const [query, setQuery] = useState(formData.customerEmail || "");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [clientInfo, setClientInfo] = useState(formData.clientInfo || null);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [userIsTyping, setUserIsTyping] = useState(false);

  const debounceTimer = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search with debounce
  const performSearch = useCallback(async (searchValue) => {
    if (!searchValue || searchValue.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setNotFound(false);
      return;
    }

    setIsSearching(true);
    setError("");
    setNotFound(false);

    try {
      const response = await companyAdminApi.searchClient({
        search: searchValue.trim(),
        limit: 10,
      });

      if (response?.success && response?.data?.clients) {
        const clients = response.data.clients;
        if (clients.length > 0) {
          setResults(clients);
          setShowDropdown(true);
          setNotFound(false);
        } else {
          setResults([]);
          setShowDropdown(false);
          setNotFound(true);
        }
      } else {
        console.error("Unexpected API response:", response);
        setResults([]);
        setShowDropdown(false);
        setNotFound(true);
        setError("No clients found. Please refine your search.");
      }
    } catch (err) {
      console.error("Error during client search:", err);
      setResults([]);
      setShowDropdown(false);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setUserIsTyping(true);

    // Clear previous selection when user starts typing something new
    if (clientInfo) {
      setClientInfo(null);
      setFormData((prev) => ({
        ...prev,
        customerEmail: "",
        customerId: null,
        customerName: "",
        clientInfo: null,
      }));
    }

    if (error) {
      setError("");
    }

    // Debounced live search
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelectClient = (client) => {
    const phone = client.phones?.[0]?.phone || "";

    const clientData = {
      id: client.id,
      email: client.email,
      name: client.name,
      phone,
      is_verified: client.is_verified,
    };

    setClientInfo(clientData);
    setQuery(client.name);
    setShowDropdown(false);
    setResults([]);
    setNotFound(false);
    setUserIsTyping(false);

    setFormData((prev) => ({
      ...prev,
      customerEmail: client.email,
      customerId: client.id,
      customerName: client.name,
      clientInfo: clientData,
    }));

    if (onEmailValid) onEmailValid(clientData);
  };

  const handleClear = () => {
    setQuery("");
    setClientInfo(null);
    setResults([]);
    setShowDropdown(false);
    setNotFound(false);
    setError("");
    setUserIsTyping(false);

    setFormData((prev) => ({
      ...prev,
      customerEmail: "",
      customerId: null,
      customerName: "",
      clientInfo: null,
    }));
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {t("orderSteps.selectCustomer") || "Search Customer"}{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={t("common.placeholders.enterNamePhoneEmail")}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 placeholder-gray-400 pr-7"
              disabled={!!clientInfo}
            />
            {isSearching && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-gray-600"></div>
              </div>
            )}
          </div>

          {clientInfo && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-md border border-gray-200"
            >
              {t("common.buttons.clear")}
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {showDropdown && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {results.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelectClient(client)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      {client.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {client.email}
                      {client.phones?.[0]?.phone && (
                        <span className="ml-2">• {client.phones[0].phone}</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      client.is_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {client.is_verified ? t("common.labels.verified") : t("common.labels.unverified")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      </div>

      {/* Found Client */}
      {clientInfo && (
        <table className="w-full text-xs border border-gray-200 rounded-md overflow-hidden">
          <tbody>
            <tr className="bg-green-50">
              <td className="px-2.5 py-1.5 text-gray-500 font-medium w-20 border-r border-gray-200">
                {t("common.labels.name")}
              </td>
              <td className="px-2.5 py-1.5 text-gray-800">
                {clientInfo.name}
              </td>
            </tr>

            <tr className="border-t border-gray-200">
              <td className="px-2.5 py-1.5 text-gray-500 font-medium border-r border-gray-200">
                {t("common.labels.email")}
              </td>
              <td className="px-2.5 py-1.5 text-gray-800">
                {clientInfo.email}
              </td>
            </tr>

            <tr className="border-t border-gray-200">
              <td className="px-2.5 py-1.5 text-gray-500 font-medium border-r border-gray-200">
                {t("common.labels.phone")}
              </td>
              <td className="px-2.5 py-1.5 text-gray-800">
                {clientInfo.phone || "—"}
              </td>
            </tr>

            <tr className="border-t border-gray-200">
              <td className="px-2.5 py-1.5 text-gray-500 font-medium border-r border-gray-200">
                {t("common.labels.verified")}
              </td>
              <td className="px-2.5 py-1.5">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    clientInfo.is_verified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {clientInfo.is_verified ? t("common.yes") : t("common.no")}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Not Found */}
      {notFound && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {t("orderSteps.customerNotFound")}
          </span>
          <button
            type="button"
            onClick={onCreateUserClick}
            className="text-xs font-medium text-gray-800 underline hover:text-gray-600"
          >
            {t("orderSteps.createUser")}
          </button>
        </div>
      )}
    </div>
  );
}