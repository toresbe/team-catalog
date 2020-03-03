package no.nav.data.team.common.validator;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

import static no.nav.data.team.common.utils.StreamUtils.safeStream;

@Slf4j
public class FieldValidator {

    private static final String ERROR_TYPE = "fieldIsNullOrMissing";
    private static final String ERROR_TYPE_ENUM = "fieldIsInvalidEnum";
    private static final String ERROR_TYPE_CODELIST_CODE = "fieldIsInvalidCodelistCode";
    private static final String ERROR_TYPE_DATE = "fieldIsInvalidDate";
    private static final String ERROR_TYPE_UUID = "fieldIsInvalidUUID";
    private static final String ERROR_MESSAGE = "%s was null or missing";
    private static final String ERROR_MESSAGE_ENUM = "%s: %s was invalid for type %s";
    private static final String ERROR_MESSAGE_CODELIST_CODE = "%s: %s code has invalid format (alphanumeric and underscore)";
    private static final String ERROR_MESSAGE_DATE = "%s: %s date is not a valid format";
    private static final String ERROR_MESSAGE_UUID = "%s: %s uuid is not a valid format";

    private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z0-9_]+$");

    private final List<ValidationError> validationErrors = new ArrayList<>();
    private final String reference;
    private final String parentField;


    public FieldValidator(String reference) {
        this.reference = reference;
        this.parentField = "";
    }

    public FieldValidator(String reference, String parentField) {
        this.reference = reference;
        this.parentField = StringUtils.appendIfMissing(parentField, ".");
    }

    public boolean checkBlank(String fieldName, String fieldValue) {
        if (StringUtils.isBlank(fieldValue)) {
            validationErrors.add(new ValidationError(reference, ERROR_TYPE, String.format(ERROR_MESSAGE, getFieldName(fieldName))));
            return true;
        }
        return false;
    }

    public void checkCodelistCode(String fieldName, String fieldValue) {
        if (checkBlank(fieldName, fieldValue)) {
            return;
        }
        if (!CODE_PATTERN.matcher(fieldValue).matches()) {
            validationErrors.add(new ValidationError(reference, ERROR_TYPE_CODELIST_CODE, String.format(ERROR_MESSAGE_CODELIST_CODE, getFieldName(fieldName), fieldValue)));
        }
    }

    public <T extends Enum<T>> void checkRequiredEnum(String fieldName, String fieldValue, Class<T> type) {
        if (checkBlank(fieldName, fieldValue)) {
            return;
        }
        try {
            Enum.valueOf(type, fieldValue);
        } catch (IllegalArgumentException e) {
            validationErrors.add(new ValidationError(reference, ERROR_TYPE_ENUM, String.format(ERROR_MESSAGE_ENUM, getFieldName(fieldName), fieldValue, type.getSimpleName())));
        }
    }

    public void checkDate(String fieldName, String fieldValue) {
        if (StringUtils.isBlank(fieldValue)) {
            return;
        }
        try {
            LocalDate.parse(fieldValue);
        } catch (DateTimeParseException e) {
            validationErrors.add(new ValidationError(reference, ERROR_TYPE_DATE, String.format(ERROR_MESSAGE_DATE, getFieldName(fieldName), fieldValue)));
        }
    }

    public void checkUUID(String fieldName, String fieldValue) {
        if (StringUtils.isBlank(fieldValue)) {
            return;
        }
        try {
            //noinspection ResultOfMethodCallIgnored
            UUID.fromString(fieldValue);
        } catch (Exception e) {
            validationErrors.add(new ValidationError(reference, ERROR_TYPE_UUID, String.format(ERROR_MESSAGE_UUID, getFieldName(fieldName), fieldValue)));
        }
    }

    public void checkId(RequestElement request) {
        boolean nullId = request.getId() == null;
        boolean update = request.isUpdate();
        if (update && nullId) {
            validationErrors.add(new ValidationError(request.getReference(), "missingIdForUpdate", String.format("%s is missing ID for update", request.getIdentifyingFields())));
        } else if (!update && !nullId) {
            validationErrors.add(new ValidationError(request.getReference(), "idForCreate", String.format("%s has ID for create", request.getIdentifyingFields())));
        }
    }

    private String getFieldName(String fieldName) {
        return parentField + fieldName;
    }

    public void validateType(String fieldName, Collection<? extends Validated> fieldValues) {
        AtomicInteger i = new AtomicInteger(0);
        safeStream(fieldValues).forEach(fieldValue -> {
            validateType(String.format("%s[%d]", fieldName, i.getAndIncrement()), fieldValue);
        });
    }

    public void validateType(String fieldName, Validated fieldValue) {
        FieldValidator fieldValidator = new FieldValidator(reference, fieldName);
        fieldValue.format();
        fieldValue.validate(fieldValidator);
        validationErrors.addAll(fieldValidator.getErrors());
    }

    public List<ValidationError> getErrors() {
        return validationErrors;
    }

    public void ifErrorsThrowValidationException() {
        RequestValidator.ifErrorsThrowValidationException(validationErrors);
    }

}