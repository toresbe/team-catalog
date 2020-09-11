package no.nav.data.common.notify.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationState implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;

    private NotificationTime time;
    private UUID lastAuditNotified;

}
