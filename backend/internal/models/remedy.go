package models

type Remedy struct {
	RawClass          string `gorm:"primaryKey;size:255" json:"raw_class"`
	PlantName         string `gorm:"size:100;not null" json:"plant_name"`
	DiseaseName       string `gorm:"size:255;not null" json:"disease_name"`
	Symptoms          string `gorm:"type:text" json:"symptoms"`
	OrganicTreatment  string `gorm:"type:text" json:"organic_treatment"`
	ChemicalTreatment string `gorm:"type:text" json:"chemical_treatment"`
	Prevention        string `gorm:"type:text" json:"prevention"`
}

