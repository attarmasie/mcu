package mapper

import (
	"backend/internal/generated"
	"backend/internal/models"
	"time"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

func ToGeneratedPatient(patient *models.Patient) generated.Patient {
	return generated.Patient{
		Id:                    openapi_types.UUID(patient.ID),
		FullName:              patient.FullName,
		DateOfBirth:           parseDate(patient.DateOfBirth),
		Gender:                generated.PatientGender(patient.Gender),
		PatientType:           generated.PatientPatientType(patient.PatientType),
		PhoneNumber:           patient.PhoneNumber,
		Email:                 castToEmail(patient.Email),
		Address:               patient.Address,
		MedicalRecordNumber:   patient.MedicalRecordNumber,
		EmergencyContactName:  patient.EmergencyContactName,
		EmergencyContactPhone: patient.EmergencyContactPhone,
		BloodType:             castToBloodType(patient.BloodType),
		Allergies:             patient.Allergies,
		CreatedAt:             &patient.CreatedAt,
		UpdatedAt:             &patient.UpdatedAt,
	}
}

func ToGeneratedPatients(patients []models.Patient) []generated.Patient {
	result := make([]generated.Patient, len(patients))
	for i := range patients {
		result[i] = ToGeneratedPatient(&patients[i])
	}
	return result
}

func ToModelPatient(req generated.CreatePatientRequest) *models.Patient {
	return &models.Patient{
		FullName:              req.FullName,
		DateOfBirth:           req.DateOfBirth.Format("2006-01-02"),
		Gender:                string(req.Gender),
		PatientType:           string(req.PatientType),
		PhoneNumber:           req.PhoneNumber,
		Email:                 castEmailToString(req.Email),
		Address:               req.Address,
		MedicalRecordNumber:   req.MedicalRecordNumber,
		EmergencyContactName:  req.EmergencyContactName,
		EmergencyContactPhone: req.EmergencyContactPhone,
		BloodType:             castRequestBloodTypeToString(req.BloodType),
		Allergies:             req.Allergies,
	}
}

func castToEmail(email *string) *openapi_types.Email {
	if email == nil {
		return nil
	}
	e := openapi_types.Email(*email)
	return &e
}

func castEmailToString(email *openapi_types.Email) *string {
	if email == nil {
		return nil
	}
	e := string(*email)
	return &e
}

func castToBloodType(bloodType *string) *generated.PatientBloodType {
	if bloodType == nil {
		return nil
	}
	bt := generated.PatientBloodType(*bloodType)
	return &bt
}

func castRequestBloodTypeToString(bloodType *generated.CreatePatientRequestBloodType) *string {
	if bloodType == nil {
		return nil
	}
	bt := string(*bloodType)
	return &bt
}

func parseDate(dateStr string) openapi_types.Date {
	if dateStr == "" {
		return openapi_types.Date{}
	}

	// Try multiple date formats (PostgreSQL may return different formats)
	formats := []string{
		"2006-01-02",
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04:05Z",
		"2006-01-02 15:04:05",
		time.RFC3339,
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return openapi_types.Date{Time: t}
		}
	}

	return openapi_types.Date{}
}
