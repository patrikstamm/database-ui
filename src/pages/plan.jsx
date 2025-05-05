import React, { useState } from "react";
import { Button } from "../components/button";
import { tiers } from "../components/tierData.js";

export default function Plan() {
  const [selectedTier, setSelectedTier] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;

    // For cardName field, only allow letters and spaces
    if (name === "cardName") {
      // Check if input contains only letters and spaces
      if (/^[A-Za-z\s]*$/.test(value)) {
        setPaymentDetails((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      // If invalid input, don't update state
    } else {
      // For other fields, update normally
      setPaymentDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitPayment = () => {
    // Check if all validations pass
    const nameIsValid =
      /^[A-Za-z\s]+$/.test(paymentDetails.cardName.trim()) &&
      paymentDetails.cardName.trim() !== "";
    const cardNumberIsValid =
      paymentDetails.cardNumber.replace(/\s/g, "").length === 16;
    const expiryIsValid = /^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate);
    const cvvIsValid = /^\d{3}$/.test(paymentDetails.cvv);

    // If any validation fails, update validation errors
    let hasErrors = false;
    const newErrors = { cardName: "", cardNumber: "", expiryDate: "", cvv: "" };

    if (!nameIsValid) {
      newErrors.cardName = "Name should contain only letters and spaces";
      hasErrors = true;
    }

    if (!cardNumberIsValid) {
      newErrors.cardNumber = "Card number must be 16 digits";
      hasErrors = true;
    }

    if (!expiryIsValid) {
      newErrors.expiryDate = "Expiry date must be in MM/YY format";
      hasErrors = true;
    }

    if (!cvvIsValid) {
      newErrors.cvv = "CVV must be 3 digits";
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(newErrors);
      return;
    }

    // If all validations pass, proceed with payment
    alert(
      `Payment processed successfully! You are now subscribed to ${selectedTier.name}`
    );
    setSelectedTier(null);
    setShowPaymentForm(false);
    setPaymentDetails({
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });
    setValidationErrors({
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });
  };

  const formatCardNumber = (value) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, "");
    // Add space after every 4 digits
    return digits
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Choose your subscription plan</h1>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`w-64 h-[300px] bg-gray-800 text-white border ${
              tier.featured ? "border-yellow-500" : "border-white"
            } p-4 rounded-xl shadow-md hover:scale-105 transform transition-transform cursor-pointer`}
            onClick={() => setSelectedTier(tier)}
          >
            <h2 className="text-xl font-bold mb-2">{tier.name}</h2>
            <p className="text-gray-300 mb-4">{tier.description}</p>
            <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
              {tier.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <p className="text-lg font-semibold">{tier.priceMonthly}</p>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          {!showPaymentForm ? (
            <div className="bg-white p-4 rounded-xl shadow-xl w-64 max-h-[300px] overflow-auto mx-auto text-black">
              <h3 className="text-lg font-bold mb-2">Confirm your plan</h3>
              <p className="mb-1 text-sm">
                You selected: <strong>{selectedTier.name}</strong>
              </p>
              <p className="mb-3 text-sm">
                Price: <strong>{selectedTier.priceMonthly}</strong>
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-sm px-2 py-1"
                  onClick={() => setSelectedTier(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="text-sm px-3 py-1"
                  onClick={() => {
                    if (selectedTier.name === "Free") {
                      alert("Subscribed to Free plan");
                      setSelectedTier(null);
                    } else {
                      setShowPaymentForm(true);
                    }
                  }}
                >
                  {selectedTier.name === "Free"
                    ? "Confirm"
                    : "Continue to Payment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-xl w-80 max-h-[440px] overflow-auto mx-auto text-black">
              <h3 className="text-lg font-bold mb-4">Enter Payment Details</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={paymentDetails.cardName}
                  onChange={handlePaymentDetailsChange}
                  onBlur={() => {
                    if (paymentDetails.cardName.trim() === "") {
                      setValidationErrors((prev) => ({
                        ...prev,
                        cardName: "Name is required",
                      }));
                    } else if (!/^[A-Za-z\s]+$/.test(paymentDetails.cardName)) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        cardName: "Name should contain only letters and spaces",
                      }));
                    } else {
                      setValidationErrors((prev) => ({
                        ...prev,
                        cardName: "",
                      }));
                    }
                  }}
                  className={`w-full p-2 border ${
                    validationErrors.cardName
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
                {validationErrors.cardName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.cardName}
                  </p>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setPaymentDetails((prev) => ({
                      ...prev,
                      cardNumber: formatted,
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 2) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      }
                      setPaymentDetails((prev) => ({
                        ...prev,
                        expiryDate: value,
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPaymentDetails((prev) => ({ ...prev, cvv: value }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </div>
              <p className="text-sm mb-4">
                You will be charged <strong>{selectedTier.priceMonthly}</strong>{" "}
                monthly for the <strong>{selectedTier.name}</strong> plan.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-sm px-2 py-1"
                  onClick={() => {
                    setShowPaymentForm(false);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="text-sm px-3 py-1"
                  onClick={handleSubmitPayment}
                  disabled={
                    !paymentDetails.cardName ||
                    paymentDetails.cardNumber.length < 16 ||
                    !paymentDetails.expiryDate ||
                    !paymentDetails.cvv
                  }
                >
                  Complete Subscription
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
