package database

import (
	"log"
	"plantdoc-backend/internal/models"

	"gorm.io/gorm"
)

var defaultRemedies = []models.Remedy{
	// Apple
	{
		RawClass:          "Apple___Apple_scab",
		PlantName:         "Apple",
		DiseaseName:       "Apple Scab",
		Symptoms:          "Olive-green to black velvety spots on leaves and scabby lesions on fruits, causing premature leaf drop and deformed fruit.",
		OrganicTreatment:  "Apply sulfur-based or copper soap sprays during early bud break. Rake and destroy fallen leaves in autumn.",
		ChemicalTreatment: "Fungicides containing myclobutanil, captan, or mancozeb applied at pink bud through petal fall.",
		Prevention:        "Plant scab-resistant cultivars (e.g., Liberty, Freedom), prune trees for open canopy and airflow, avoid overhead watering.",
	},
	{
		RawClass:          "Apple___Black_rot",
		PlantName:         "Apple",
		DiseaseName:       "Black Rot",
		Symptoms:          "Frog-eye leaf spots with brown centers and purple borders; rotting fruit turns black and mummifies on the branch.",
		OrganicTreatment:  "Prune out dead wood, cankers, and remove all mummified apples hanging from trees or on the ground.",
		ChemicalTreatment: "Captan, thiophanate-methyl, or copper fungicides applied from tight cluster until harvest.",
		Prevention:        "Maintain tree vigor through balanced fertilization, disinfect pruning shears with 70% alcohol between cuts.",
	},
	{
		RawClass:          "Apple___Cedar_apple_rust",
		PlantName:         "Apple",
		DiseaseName:       "Cedar Apple Rust",
		Symptoms:          "Bright yellow-orange spots on the upper leaf surface, with raised orange-brown tubular pustules underneath.",
		OrganicTreatment:  "Spray sulfur or neem oil early in the season. Remove nearby Eastern Red Cedar and Juniper galls within 1-2 miles if possible.",
		ChemicalTreatment: "Fungicides containing myclobutanil or propiconazole applied when cedar galls swell in spring rains.",
		Prevention:        "Plant rust-resistant apple varieties such as Enterprise or Redfree. Avoid planting apples adjacent to junipers.",
	},
	{
		RawClass:          "Apple___healthy",
		PlantName:         "Apple",
		DiseaseName:       "Healthy",
		Symptoms:          "Vibrant, uniform green foliage with no visible lesions, discoloration, or pests.",
		OrganicTreatment:  "No treatment necessary. Maintain mulch around root drip line and balanced compost.",
		ChemicalTreatment: "None required.",
		Prevention:        "Annual pruning during dormancy, seasonal monitoring, and deep watering during dry spells.",
	},

	// Blueberry
	{
		RawClass:          "Blueberry___healthy",
		PlantName:         "Blueberry",
		DiseaseName:       "Healthy",
		Symptoms:          "Crisp green leaves and robust stem growth with no signs of chlorosis or leaf spot.",
		OrganicTreatment:  "No treatment needed. Keep soil acidic (pH 4.5 - 5.5) using pine bark mulch and sulfur.",
		ChemicalTreatment: "None required.",
		Prevention:        "Ensure well-drained, acidic soil and consistent moisture without waterlogging roots.",
	},

	// Cherry
	{
		RawClass:          "Cherry_(including_sour)___Powdery_mildew",
		PlantName:         "Cherry",
		DiseaseName:       "Powdery Mildew",
		Symptoms:          "White, powdery fungal coating on leaves, shoots, and young fruit, causing leaf curling and stunted shoot growth.",
		OrganicTreatment:  "Spray potassium bicarbonate, neem oil, or dilute milk spray (40% milk, 60% water) on sunny mornings.",
		ChemicalTreatment: "Fungicides containing myclobutanil, tebuconazole, or triflumizole.",
		Prevention:        "Prune for optimal sunlight penetration and air movement; avoid excess nitrogen fertilizer which stimulates susceptible tender growth.",
	},
	{
		RawClass:          "Cherry_(including_sour)___healthy",
		PlantName:         "Cherry",
		DiseaseName:       "Healthy",
		Symptoms:          "Lush foliage with strong branch development and no fungal patches.",
		OrganicTreatment:  "No treatment required.",
		ChemicalTreatment: "None required.",
		Prevention:        "Regular seasonal irrigation, clean weed control around trunk base, and dormant oil spray in early spring.",
	},

	// Corn
	{
		RawClass:          "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
		PlantName:         "Corn (Maize)",
		DiseaseName:       "Gray Leaf Spot",
		Symptoms:          "Tan to gray rectangular lesions bounded by leaf veins, expanding into large necrotic strips.",
		OrganicTreatment:  "Crop rotation and deep incorporation of infected crop debris into soil post-harvest.",
		ChemicalTreatment: "Foliar fungicides such as azoxystrobin, pyraclostrobin, or propiconazole at tassel emergence.",
		Prevention:        "Select tolerant corn hybrids, avoid continuous corn-on-corn planting, and improve soil drainage.",
	},
	{
		RawClass:          "Corn_(maize)___Common_rust_",
		PlantName:         "Corn (Maize)",
		DiseaseName:       "Common Rust",
		Symptoms:          "Small, circular to elongate reddish-brown pustules scattered over both leaf surfaces that turn powdery brown.",
		OrganicTreatment:  "Early planting to avoid high late-summer spore loads. Destroy severely infected plant matter.",
		ChemicalTreatment: "Strobilurin or triazole fungicides applied if pustules appear before tasseling.",
		Prevention:        "Plant rust-resistant hybrids; ensure balanced potassium and phosphorus levels in soil.",
	},
	{
		RawClass:          "Corn_(maize)___Northern_Leaf_Blight",
		PlantName:         "Corn (Maize)",
		DiseaseName:       "Northern Leaf Blight",
		Symptoms:          "Large cigar-shaped, grayish-green or tan lesions (1 to 6 inches long) that coalesce and scorch the foliage.",
		OrganicTreatment:  "Plow crop residues into the soil; practice 2-year crop rotation with non-host crops (soybean, wheat).",
		ChemicalTreatment: "Fungicides containing azoxystrobin + propiconazole applied at economic threshold.",
		Prevention:        "Use resistant hybrid seeds (carrying Ht genes) and avoid high plant densities that limit airflow.",
	},
	{
		RawClass:          "Corn_(maize)___healthy",
		PlantName:         "Corn (Maize)",
		DiseaseName:       "Healthy",
		Symptoms:          "Broad, deep green leaves with strong stalks and vigorous tassel development.",
		OrganicTreatment:  "No action required. Provide balanced nitrogen feeding during rapid vegetative growth.",
		ChemicalTreatment: "None required.",
		Prevention:        "Proper plant spacing (30-inch rows) and weed-free field borders.",
	},

	// Grape
	{
		RawClass:          "Grape___Black_rot",
		PlantName:         "Grape",
		DiseaseName:       "Black Rot",
		Symptoms:          "Reddish-brown circular leaf spots with tiny black pycnidia; berries shrivel, blacken, and turn into hard mummies.",
		OrganicTreatment:  "Copper octanoate or sulfur sprays. Thoroughly prune all mummified grape clusters during winter.",
		ChemicalTreatment: "Mancozeb, captan, or kresoxim-methyl applied from 2-inch shoot growth through post-bloom.",
		Prevention:        "Canopy management: shoot positioning and leaf pulling around grape bunches to lower canopy humidity.",
	},
	{
		RawClass:          "Grape___Esca_(Black_Measles)",
		PlantName:         "Grape",
		DiseaseName:       "Esca (Black Measles)",
		Symptoms:          "'Tiger-stripe' yellow/red discoloration between leaf veins; berries show dark speckles and cracked skins.",
		OrganicTreatment:  "Prune out dead spurs and arms. Paint pruning wounds with biological trichoderma formulations.",
		ChemicalTreatment: "Currently no curative chemical sprays exist; preventive wound protectants (e.g., thiophanate-methyl) on large vine cuts.",
		Prevention:        "Avoid large pruning cuts in wet weather; disinfect shears; replace severely infected vines.",
	},
	{
		RawClass:          "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
		PlantName:         "Grape",
		DiseaseName:       "Leaf Blight (Isariopsis Spot)",
		Symptoms:          "Dark brown or purple angular spots on leaves, becoming necrotic and leading to early autumn defoliation.",
		OrganicTreatment:  "Bordeaux mixture or copper hydroxide sprays applied after fruit set.",
		ChemicalTreatment: "Fungicide sprays targeting foliar spots (chlorothalonil or carbendazim).",
		Prevention:        "Ensure good row orientation for wind passage, prune dense water shoots, and clean vineyard floor.",
	},
	{
		RawClass:          "Grape___healthy",
		PlantName:         "Grape",
		DiseaseName:       "Healthy",
		Symptoms:          "Expansive, vibrant green foliage with strong vine canes and clean fruit clusters.",
		OrganicTreatment:  "No treatment needed. Apply organic compost around vine roots in spring.",
		ChemicalTreatment: "None required.",
		Prevention:        "Trellising, regular shoot thinning, and drip irrigation to keep leaves dry.",
	},

	// Orange
	{
		RawClass:          "Orange___Haunglongbing_(Citrus_greening)",
		PlantName:         "Orange",
		DiseaseName:       "Citrus Greening (Huanglongbing)",
		Symptoms:          "Asymmetric blotchy mottling on leaves, yellow shoots, small lopsided fruits that remain green at the bottom.",
		OrganicTreatment:  "Control Asian Citrus Psyllid vector with horticultural oils and introduce predatory wasp Tamarixia radiata.",
		ChemicalTreatment: "Imidacloprid or cyantraniliprole to suppress psyllid insect vectors; foliar micronutrient feeding to prolong tree productivity.",
		Prevention:        "Plant certified disease-free nursery trees; scout weekly for psyllids; remove heavily infected trees immediately.",
	},

	// Peach
	{
		RawClass:          "Peach___Bacterial_spot",
		PlantName:         "Peach",
		DiseaseName:       "Bacterial Spot",
		Symptoms:          "Angular water-soaked spots that turn purple-black and drop out ('shot-hole' effect); pitted spots on fruit skin.",
		OrganicTreatment:  "Copper sprays at dormant bud break and post-harvest before leaf fall.",
		ChemicalTreatment: "Oxytetracycline or low-rate fixed copper formulations applied weekly during warm, rainy spring periods.",
		Prevention:        "Plant resistant cultivars (e.g., Clayton, Biscoe); maintain shelterbelts to reduce windblown sand abrasions.",
	},
	{
		RawClass:          "Peach___healthy",
		PlantName:         "Peach",
		DiseaseName:       "Healthy",
		Symptoms:          "Smooth, lance-shaped bright green leaves free of perforations, cankers, or gummosis.",
		OrganicTreatment:  "No action needed.",
		ChemicalTreatment: "None required.",
		Prevention:        "Open-center pruning for sunlight and dormant copper spray to prevent peach leaf curl.",
	},

	// Bell Pepper
	{
		RawClass:          "Pepper,_bell___Bacterial_spot",
		PlantName:         "Bell Pepper",
		DiseaseName:       "Bacterial Spot",
		Symptoms:          "Small, circular, water-soaked spots on leaves that turn brown with yellow halos, causing heavy leaf drop.",
		OrganicTreatment:  "Spray copper soap or Bacillus subtilis weekly. Remove infected lower leaves.",
		ChemicalTreatment: "Copper hydroxide combined with mancozeb for improved bacterial suppression.",
		Prevention:        "Use certified disease-free seeds, practice 3-year crop rotation with non-solanaceous crops, avoid overhead sprinklers.",
	},
	{
		RawClass:          "Pepper,_bell___healthy",
		PlantName:         "Bell Pepper",
		DiseaseName:       "Healthy",
		Symptoms:          "Glossy dark green foliage with upright stems and crisp white blossoms.",
		OrganicTreatment:  "No treatment needed. Keep soil evenly moist.",
		ChemicalTreatment: "None required.",
		Prevention:        "Mulch with straw or black plastic to prevent soil splash and support steady soil temperature.",
	},

	// Potato
	{
		RawClass:          "Potato___Early_blight",
		PlantName:         "Potato",
		DiseaseName:       "Early Blight",
		Symptoms:          "Concentric dark brown rings forming 'bullseye' target spots on older leaves, surrounded by yellowing tissue.",
		OrganicTreatment:  "Apply copper fungicides or bio-fungicides (Bacillus amyloliquefaciens). Prune diseased lower foliage.",
		ChemicalTreatment: "Chlorothalonil, mancozeb, or azoxystrobin applied every 7-10 days under humid conditions.",
		Prevention:        "Ensure adequate nitrogen and potassium fertility; rotate crops for 3-4 years; avoid sprinkler irrigation.",
	},
	{
		RawClass:          "Potato___Late_blight",
		PlantName:         "Potato",
		DiseaseName:       "Late Blight",
		Symptoms:          "Water-soaked dark lesions on leaf tips and margins with white fuzzy fungal growth on the underside during high humidity.",
		OrganicTreatment:  "Copper hydroxide or copper sulfate sprays. Destroy infected foliage immediately to prevent tuber rot.",
		ChemicalTreatment: "Fluopicolide, cyazofamid, or mandipropamid applied preventatively when weather forecasts cool, wet periods.",
		Prevention:        "Plant certified disease-free seed tubers, eliminate volunteer potatoes, and hill soil deeply over tubers.",
	},
	{
		RawClass:          "Potato___healthy",
		PlantName:         "Potato",
		DiseaseName:       "Healthy",
		Symptoms:          "Bushy green foliage with sturdy petioles and no spots, wilting, or yellowing.",
		OrganicTreatment:  "No action needed.",
		ChemicalTreatment: "None required.",
		Prevention:        "Hill tubers regularly, provide well-drained acidic soil (pH 5.0 - 6.0), and water at ground level.",
	},

	// Raspberry
	{
		RawClass:          "Raspberry___healthy",
		PlantName:         "Raspberry",
		DiseaseName:       "Healthy",
		Symptoms:          "Vigorous canes with serrated green leaves and no signs of cane blight or rust.",
		OrganicTreatment:  "No action needed.",
		ChemicalTreatment: "None required.",
		Prevention:        "Thin canes to 4-5 per foot of row, prune out spent floricanes after fruiting, and mulch canes.",
	},

	// Soybean
	{
		RawClass:          "Soybean___healthy",
		PlantName:         "Soybean",
		DiseaseName:       "Healthy",
		Symptoms:          "Healthy trifoliate leaves with vibrant green coloration and uniform canopy closure.",
		OrganicTreatment:  "No action needed.",
		ChemicalTreatment: "None required.",
		Prevention:        "Crop rotation with corn or small grains, inoculated seed planting, and proper row spacing.",
	},

	// Squash
	{
		RawClass:          "Squash___Powdery_mildew",
		PlantName:         "Squash",
		DiseaseName:       "Powdery Mildew",
		Symptoms:          "White talcum-powder-like patches covering the upper and lower surfaces of leaves, causing premature yellowing and dieback.",
		OrganicTreatment:  "Spray baking soda solution (1 tsp baking soda + 1/2 tsp vegetable oil in 1 qt water) or neem oil.",
		ChemicalTreatment: "Myclobutanil, triflumizole, or chlorothalonil applied at first sign of white spots.",
		Prevention:        "Space plants 3-4 feet apart in full sun; select mildew-resistant varieties; water early in the morning.",
	},

	// Strawberry
	{
		RawClass:          "Strawberry___Leaf_scorch",
		PlantName:         "Strawberry",
		DiseaseName:       "Leaf Scorch",
		Symptoms:          "Irregular purple-red blotches on leaves that enlarge and turn dark brown, giving the leaf a burnt appearance.",
		OrganicTreatment:  "Rake and remove old dead leaves after renovation; spray copper-based organic fungicides.",
		ChemicalTreatment: "Captan or thiophanate-methyl applied during bloom and runner formation.",
		Prevention:        "Plant in well-drained raised beds, avoid overhead irrigation, and renovate strawberry beds annually.",
	},
	{
		RawClass:          "Strawberry___healthy",
		PlantName:         "Strawberry",
		DiseaseName:       "Healthy",
		Symptoms:          "Deep green trifoliate leaves, active runner production, and clean white blooms.",
		OrganicTreatment:  "No action needed. Provide clean straw mulch around crowns.",
		ChemicalTreatment: "None required.",
		Prevention:        "Keep fruit and foliage elevated off wet bare soil with pine straw or weed fabric.",
	},

	// Tomato
	{
		RawClass:          "Tomato___Bacterial_spot",
		PlantName:         "Tomato",
		DiseaseName:       "Bacterial Spot",
		Symptoms:          "Small greasy water-soaked circular spots on leaves that turn dark brown with translucent halos; yellowing foliage.",
		OrganicTreatment:  "Copper octanoate or Bacillus subtilis foliar sprays. Remove and discard heavily infected lower leaves.",
		ChemicalTreatment: "Fixed copper combined with mancozeb sprayed every 7 days during warm wet weather.",
		Prevention:        "Never work in wet tomato plants; use drip irrigation; disinfect tomato stakes and cages between seasons.",
	},
	{
		RawClass:          "Tomato___Early_blight",
		PlantName:         "Tomato",
		DiseaseName:       "Early Blight",
		Symptoms:          "Dark brown spots with concentric target rings on bottom leaves, spreading upward with surrounding yellow chlorosis.",
		OrganicTreatment:  "Prune off the bottom 12-18 inches of foliage. Apply copper fungicide or bio-fungicide weekly.",
		ChemicalTreatment: "Chlorothalonil, mancozeb, or azoxystrobin applied preventatively.",
		Prevention:        "Mulch tomato bases to stop soil spores splashing onto lower leaves; rotate with non-solanaceous crops for 3 years.",
	},
	{
		RawClass:          "Tomato___Late_blight",
		PlantName:         "Tomato",
		DiseaseName:       "Late Blight",
		Symptoms:          "Large greasy dark green/brown water-soaked patches on leaves and stems; white mold on underside in damp weather.",
		OrganicTreatment:  "Copper fungicides applied before infection takes hold. Pull and destroy heavily infected vines.",
		ChemicalTreatment: "Mandipropamid, chlorothalonil, or cymoxanil.",
		Prevention:        "Ensure high air circulation, stake or cage plants upright, and destroy volunteer tomato/potato shoots.",
	},
	{
		RawClass:          "Tomato___Leaf_Mold",
		PlantName:         "Tomato",
		DiseaseName:       "Leaf Mold",
		Symptoms:          "Pale green or yellowish spots on upper leaf surfaces, with olive-green to gray velvety mold growth on the lower surface.",
		OrganicTreatment:  "Copper soap fungicides; maximize greenhouse/tunnel ventilation to reduce humidity below 85%.",
		ChemicalTreatment: "Chlorothalonil, mancozeb, or difenoconazole.",
		Prevention:        "Prune suckers and dense foliage for maximum airflow; avoid wetting foliage when watering.",
	},
	{
		RawClass:          "Tomato___Septoria_leaf_spot",
		PlantName:         "Tomato",
		DiseaseName:       "Septoria Leaf Spot",
		Symptoms:          "Numerous small, circular spots (1/8 inch) with dark brown borders and grayish-white centers dotted with tiny black pycnidia.",
		OrganicTreatment:  "Remove diseased lower leaves. Spray liquid copper or potassium bicarbonate.",
		ChemicalTreatment: "Chlorothalonil or mancozeb applied at the first onset of lower leaf spotting.",
		Prevention:        "Crop rotation, heavy mulching under plants, and thorough end-of-season garden cleanup.",
	},
	{
		RawClass:          "Tomato___Spider_mites Two-spotted_spider_mite",
		PlantName:         "Tomato",
		DiseaseName:       "Spider Mites",
		Symptoms:          "Fine yellow stippling or bronzing on leaves; fine silky webbing on undersides of leaves and growing tips.",
		OrganicTreatment:  "Spray insecticidal soap, rosemary oil, or release predatory mites (Phytoseiulus persimilis).",
		ChemicalTreatment: "Abamectin, bifenazate, or spiromesifen miticides.",
		Prevention:        "Keep plants well hydrated during dry, dusty heat waves; spray undersides of leaves with water jet.",
	},
	{
		RawClass:          "Tomato___Target_Spot",
		PlantName:         "Tomato",
		DiseaseName:       "Target Spot",
		Symptoms:          "Brown pinpoint lesions that expand into circular brown spots with faint concentric rings and yellow halos.",
		OrganicTreatment:  "Apply copper bactericide/fungicide formulations; remove infected plant debris.",
		ChemicalTreatment: "Azoxystrobin, pyraclostrobin, or chlorothalonil.",
		Prevention:        "Wide row spacing, weed management, and drip irrigation to avoid wet foliage.",
	},
	{
		RawClass:          "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
		PlantName:         "Tomato",
		DiseaseName:       "Tomato Yellow Leaf Curl Virus",
		Symptoms:          "Stunted growth, leaves curl upward into cups with bright yellow margins; severe drop in fruit set.",
		OrganicTreatment:  "Control whitefly insect vectors with yellow sticky traps, insecticidal soap, and neem oil.",
		ChemicalTreatment: "Insecticides targeting whiteflies (imidacloprid, acetamiprid, or pymetrozine). No chemical cure for the virus.",
		Prevention:        "Plant TYLCV-resistant cultivars (e.g., Mountain Magic, Tycoon); use reflective silver mulches.",
	},
	{
		RawClass:          "Tomato___Tomato_mosaic_virus",
		PlantName:         "Tomato",
		DiseaseName:       "Tomato Mosaic Virus",
		Symptoms:          "Mottled light and dark green mosaic patterns on leaves, fern-like leaf distortion, and stunted fruit growth.",
		OrganicTreatment:  "Remove and burn or discard infected plants immediately. Wash hands with soap and water after handling.",
		ChemicalTreatment: "No chemical control available. Prevention and vector sanitation are key.",
		Prevention:        "Disinfect tools with 20% nonfat dry milk or bleach solution. Prohibit smoking/tobacco near tomato plants.",
	},
	{
		RawClass:          "Tomato___healthy",
		PlantName:         "Tomato",
		DiseaseName:       "Healthy",
		Symptoms:          "Deep green, lush foliage with strong flowering clusters and clean, blemish-free stems.",
		OrganicTreatment:  "No action needed. Apply organic compost tea or fish emulsion every 2-3 weeks.",
		ChemicalTreatment: "None required.",
		Prevention:        "Cage plants, prune bottom suckers, water deeply at ground level, and maintain 3 inches of straw mulch.",
	},
}

// SeedRemedies populates the remedies table if it is currently empty.
func SeedRemedies(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.Remedy{}).Count(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		log.Printf("Seeding %d plant disease remedies into database...", len(defaultRemedies))
		if err := db.CreateInBatches(defaultRemedies, 50).Error; err != nil {
			log.Printf("Error bulk seeding remedies: %v", err)
			return err
		}
		log.Println("Remedies seeded successfully.")
	} else {
		log.Printf("Remedies database already seeded (%d entries found).", count)
	}

	return nil
}
