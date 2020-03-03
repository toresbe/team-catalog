package no.nav.data.team.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CodelistNotErasableException extends IllegalStateException {

    public CodelistNotErasableException(String message) {
        super(message);
    }
}
