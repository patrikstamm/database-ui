import React, { useState } from "react";
import { Button } from "../components/button";

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    priceMonthly: 'Free',
    description: "A standard access of our platform.",
    features: ['Can watch on 720p.', '10 free movie access per month'],
    featured: false,
  },
  {
    name: 'Basic',
    id: 'tier-basic',
    priceMonthly: '$49',
    description: "Access to more content in HD.",
    features: ['Can watch on 1080p.', '30 free movie access per month', 'No Ads'],
    featured: false,
  },
  {
    name: 'Premium',
    id: 'tier-premium',
    priceMonthly: '$99',
    description: 'Access for every content on our platform.',
    features: ['Can watch on 4k', 'Unlimited access to any movies', 'No Ads'],
    featured: true,
  },
];

export default function Plan() {
  const [selectedTier, setSelectedTier] = useState(null);

  console.log("Tiers loaded:", tiers); 

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
              tier.featured ? 'border-yellow-500' : 'border-white'
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
                onClick={() => alert(`Subscribed to ${selectedTier.name}`)}//confirm sub
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
