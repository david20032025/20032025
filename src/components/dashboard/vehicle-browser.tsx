"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { fetchCarPrice } from "@/utils/car-api";
import { Car, Info, MapPin, DollarSign, Calendar } from "lucide-react";

interface VehicleListing {
  id: string;
  price: number;
  miles: number;
  build?: {
    year: string;
    make: string;
    model: string;
    trim: string;
  };
  dealer?: {
    city: string;
    state: string;
  };
  features?: string[];
  exteriorColor?: string;
  interiorColor?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
}

interface SearchResults {
  averagePrice: number;
  totalListings: number;
  listings: VehicleListing[];
}

export default function VehicleBrowser() {
  // États pour les sélections
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState<VehicleListing | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);

  // Données pour les menus déroulants
  const makes = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
    "Audi",
    "Tesla",
    "Volkswagen",
    "Hyundai",
    "Kia",
    "Nissan",
    "Subaru",
    "Mazda",
    "Lexus",
  ];

  // Modèles par marque
  const modelsByMake: Record<string, string[]> = {
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Prius"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Fit"],
    Ford: ["F-150", "Mustang", "Explorer", "Escape", "Edge", "Bronco"],
    Chevrolet: [
      "Silverado",
      "Equinox",
      "Tahoe",
      "Malibu",
      "Camaro",
      "Suburban",
    ],
    BMW: ["3 Series", "5 Series", "X3", "X5", "7 Series", "i4"],
    Mercedes: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "A-Class"],
    Audi: ["A4", "A6", "Q5", "Q7", "e-tron", "A3"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    Volkswagen: ["Golf", "Jetta", "Tiguan", "Atlas", "ID.4", "Passat"],
    Hyundai: ["Elantra", "Tucson", "Santa Fe", "Sonata", "Kona", "Palisade"],
    Kia: ["Forte", "Sportage", "Telluride", "Sorento", "Soul", "Seltos"],
    Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Kicks"],
    Subaru: ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "Legacy"],
    Mazda: ["CX-5", "Mazda3", "CX-9", "CX-30", "MX-5 Miata", "Mazda6"],
    Lexus: ["RX", "ES", "NX", "IS", "GX", "UX"],
  };

  // Années disponibles (10 dernières années)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i <= 10; i++) {
    years.push((currentYear - i).toString());
  }

  // Modèles disponibles basés sur la marque sélectionnée
  const availableModels = make ? modelsByMake[make] || [] : [];

  // Réinitialiser le modèle et l'année lorsque la marque change
  useEffect(() => {
    setModel("");
    setYear("");
  }, [make]);

  // Réinitialiser l'année lorsque le modèle change
  useEffect(() => {
    setYear("");
  }, [model]);

  // Rechercher les véhicules lorsque tous les critères sont sélectionnés
  useEffect(() => {
    if (make && model && year) {
      handleSearch();
    }
  }, [make, model, year]);

  const handleSearch = async () => {
    if (!make || !model || !year) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await fetchCarPrice(make, model, year);
      setResults(data);
    } catch (err) {
      setError(
        "Impossible de récupérer les prix des véhicules. Veuillez réessayer.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleListingClick = (listing: VehicleListing) => {
    setSelectedListing(listing);
    setShowDetails(true);
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Formater le kilométrage
  const formatMileage = (miles: number) => {
    // Conversion approximative de miles en kilomètres
    const kilometers = Math.round(miles * 1.60934);
    return new Intl.NumberFormat("fr-FR").format(kilometers) + " km";
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Car className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Explorateur de Véhicules</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Sélection de la marque */}
        <div className="space-y-2">
          <Label htmlFor="make">Marque</Label>
          <Select value={make} onValueChange={setMake}>
            <SelectTrigger id="make" className="w-full">
              <SelectValue placeholder="Sélectionner une marque" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection du modèle */}
        <div className="space-y-2">
          <Label htmlFor="model">Modèle</Label>
          <Select
            value={model}
            onValueChange={setModel}
            disabled={!make || availableModels.length === 0}
          >
            <SelectTrigger id="model" className="w-full">
              <SelectValue
                placeholder={
                  !make
                    ? "Sélectionnez d'abord une marque"
                    : "Sélectionner un modèle"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection de l'année */}
        <div className="space-y-2">
          <Label htmlFor="year">Année</Label>
          <Select
            value={year}
            onValueChange={setYear}
            disabled={!make || !model}
          >
            <SelectTrigger id="year" className="w-full">
              <SelectValue
                placeholder={
                  !model
                    ? "Sélectionnez d'abord un modèle"
                    : "Sélectionner une année"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded-md flex items-center gap-2">
          <Info className="h-5 w-5" />
          {error}
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {year} {make} {model}
            </h3>
            <div className="text-lg font-bold text-primary flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              Prix moyen: {formatPrice(results.averagePrice)}
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {results.totalListings} annonces trouvées
          </div>

          {results.listings && results.listings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-lg">Annonces disponibles</h4>
              <div className="grid gap-3">
                {results.listings.map((listing, index) => (
                  <div
                    key={listing.id || index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleListingClick(listing)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {listing.build?.year} {listing.build?.make}{" "}
                          {listing.build?.model} {listing.build?.trim}
                        </h5>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          {formatMileage(listing.miles)}
                          {listing.dealer?.city && listing.dealer?.state && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3 w-3" />
                              <span>
                                {listing.dealer.city}, {listing.dealer.state}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(listing.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogue de détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedListing?.build?.year} {selectedListing?.build?.make}{" "}
              {selectedListing?.build?.model} {selectedListing?.build?.trim}
            </DialogTitle>
            <DialogDescription>Détails du véhicule</DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      {formatPrice(selectedListing.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kilométrage</p>
                    <p className="text-xl font-bold">
                      {formatMileage(selectedListing.miles)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Caractéristiques</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Marque</p>
                    <p className="font-medium">{selectedListing.build?.make}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Modèle</p>
                    <p className="font-medium">
                      {selectedListing.build?.model}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Année</p>
                    <p className="font-medium">{selectedListing.build?.year}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Finition</p>
                    <p className="font-medium">{selectedListing.build?.trim}</p>
                  </div>
                </div>
              </div>

              {selectedListing.exteriorColor ||
              selectedListing.interiorColor ||
              selectedListing.transmission ||
              selectedListing.fuelType ||
              selectedListing.bodyType ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Spécifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedListing.exteriorColor && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">
                          Couleur extérieure
                        </p>
                        <p className="font-medium">
                          {selectedListing.exteriorColor}
                        </p>
                      </div>
                    )}
                    {selectedListing.interiorColor && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">
                          Couleur intérieure
                        </p>
                        <p className="font-medium">
                          {selectedListing.interiorColor}
                        </p>
                      </div>
                    )}
                    {selectedListing.transmission && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Transmission</p>
                        <p className="font-medium">
                          {selectedListing.transmission}
                        </p>
                      </div>
                    )}
                    {selectedListing.fuelType && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Carburant</p>
                        <p className="font-medium">
                          {selectedListing.fuelType}
                        </p>
                      </div>
                    )}
                    {selectedListing.bodyType && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">
                          Type de carrosserie
                        </p>
                        <p className="font-medium">
                          {selectedListing.bodyType}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <h4 className="font-medium">Localisation</h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Concessionnaire</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    {selectedListing.dealer?.city},{" "}
                    {selectedListing.dealer?.state}
                  </p>
                </div>
              </div>

              {selectedListing.features &&
                selectedListing.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Équipements</h4>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <ul className="grid grid-cols-2 gap-2">
                        {selectedListing.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-1"
                          >
                            <span className="text-primary">•</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              <div className="flex justify-end space-x-3 pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
                <Button>Contacter le vendeur</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
