import { NextResponse } from "next/server";

// Fonction pour générer des données aléatoires de voitures
function generateMockCarData(make: string, model: string, year: string) {
  // Générer un prix moyen basé sur la marque et l'année
  const basePrice = getBasePriceForMake(make);
  const yearFactor = parseInt(year) / new Date().getFullYear();
  const averagePrice = Math.round(basePrice * yearFactor);

  // Générer un nombre aléatoire d'annonces
  const totalListings = Math.floor(Math.random() * 15) + 5;

  // Générer des annonces aléatoires
  const listings = [];
  for (let i = 0; i < totalListings; i++) {
    // Variation de prix autour de la moyenne
    const priceVariation = (Math.random() * 0.3 - 0.15) * averagePrice;
    const price = Math.round(averagePrice + priceVariation);

    // Kilométrage aléatoire (en miles)
    const miles = Math.floor(Math.random() * 50000) + 5000;

    // Finitions possibles
    const trims = [
      "Base",
      "Sport",
      "Luxury",
      "Premium",
      "Executive",
      "Limited",
    ];
    const trim = trims[Math.floor(Math.random() * trims.length)];

    // Villes et états aléatoires
    const cities = [
      "Paris",
      "Lyon",
      "Marseille",
      "Bordeaux",
      "Lille",
      "Toulouse",
    ];
    const states = [
      "Île-de-France",
      "Rhône-Alpes",
      "PACA",
      "Aquitaine",
      "Hauts-de-France",
      "Occitanie",
    ];
    const cityIndex = Math.floor(Math.random() * cities.length);

    // Couleurs extérieures possibles
    const exteriorColors = ["Noir", "Blanc", "Gris", "Bleu", "Rouge", "Argent"];
    const exteriorColor =
      exteriorColors[Math.floor(Math.random() * exteriorColors.length)];

    // Couleurs intérieures possibles
    const interiorColors = ["Noir", "Beige", "Gris", "Marron", "Blanc"];
    const interiorColor =
      interiorColors[Math.floor(Math.random() * interiorColors.length)];

    // Types de transmission
    const transmissions = [
      "Automatique",
      "Manuelle",
      "CVT",
      "Double embrayage",
    ];
    const transmission =
      transmissions[Math.floor(Math.random() * transmissions.length)];

    // Types de carburant
    const fuelTypes = [
      "Essence",
      "Diesel",
      "Hybride",
      "Électrique",
      "Hybride rechargeable",
    ];
    const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];

    // Types de carrosserie
    const bodyTypes = [
      "Berline",
      "SUV",
      "Break",
      "Coupé",
      "Cabriolet",
      "Monospace",
    ];
    const bodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

    // Équipements possibles
    const allFeatures = [
      "Climatisation automatique",
      "Sièges chauffants",
      "Toit ouvrant",
      "Système de navigation",
      "Caméra de recul",
      "Bluetooth",
      "Apple CarPlay/Android Auto",
      "Régulateur de vitesse adaptatif",
      "Assistance au stationnement",
      "Système audio premium",
      "Sièges en cuir",
      "Démarrage sans clé",
      "Jantes en alliage",
      "Phares LED",
      "Capteurs de pluie",
      "Surveillance des angles morts",
      "Assistance au maintien de voie",
      "Freinage d'urgence automatique",
    ];

    // Sélectionner un nombre aléatoire d'équipements
    const numFeatures = Math.floor(Math.random() * 8) + 3;
    const features = [];
    const featuresCopy = [...allFeatures];

    for (let j = 0; j < numFeatures; j++) {
      if (featuresCopy.length === 0) break;
      const index = Math.floor(Math.random() * featuresCopy.length);
      features.push(featuresCopy[index]);
      featuresCopy.splice(index, 1);
    }

    listings.push({
      id: `listing-${make}-${model}-${i}`,
      price,
      miles,
      build: {
        year,
        make,
        model,
        trim,
      },
      dealer: {
        city: cities[cityIndex],
        state: states[cityIndex],
      },
      exteriorColor,
      interiorColor,
      transmission,
      fuelType,
      bodyType,
      features,
    });
  }

  return {
    averagePrice,
    totalListings,
    listings,
  };
}

// Prix de base par marque (en euros)
function getBasePriceForMake(make: string): number {
  const basePrices: Record<string, number> = {
    Toyota: 25000,
    Honda: 23000,
    Ford: 28000,
    Chevrolet: 27000,
    BMW: 45000,
    Mercedes: 50000,
    Audi: 42000,
    Tesla: 55000,
    Volkswagen: 30000,
    Hyundai: 22000,
    Kia: 21000,
    Nissan: 24000,
    Subaru: 26000,
    Mazda: 25000,
    Lexus: 40000,
  };

  return basePrices[make] || 25000;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const year = searchParams.get("year");

  if (!make || !model || !year) {
    return NextResponse.json(
      { error: "Les paramètres make, model et year sont requis" },
      { status: 400 },
    );
  }

  try {
    // Simuler un délai de réseau
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Générer des données fictives
    const data = generateMockCarData(make, model, year);

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des prix de voitures:",
      error,
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 },
    );
  }
}
