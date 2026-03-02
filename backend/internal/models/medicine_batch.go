package models

import "time"

type MedicineBatch struct {
	BaseUUID

	MedicineID string   `gorm:"type:uuid;not null;index;uniqueIndex:uq_medicine_batch" json:"medicine_id"`
	Medicine   Medicine `gorm:"foreignKey:MedicineID" json:"medicine"`

	BatchNumber    string    `gorm:"type:varchar(100);not null;uniqueIndex:uq_medicine_batch" json:"batch_number"`
	ExpirationDate time.Time `gorm:"type:date;not null;index;uniqueIndex:uq_medicine_batch" json:"expiration_date"`

	Quantity     int      `gorm:"not null;check:quantity >= 0" json:"quantity"`
	Unit         string   `gorm:"type:varchar(50);not null" json:"unit"`
	MinimumStock int      `gorm:"not null;default:0;check:minimum_stock >= 0" json:"minimum_stock"`
	UnitCost     *float64 `gorm:"type:decimal(15,2);check:unit_cost >= 0" json:"unit_cost"`
	SellingPrice *float64 `gorm:"type:decimal(15,2);check:selling_price >= 0" json:"selling_price"`

	Status string `gorm:"type:varchar(20);not null;default:'active';index" json:"status"` // active, expired, depleted

	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"deleted_at,omitempty"`
}

func (MedicineBatch) TableName() string {
	return "medicine_batches"
}
