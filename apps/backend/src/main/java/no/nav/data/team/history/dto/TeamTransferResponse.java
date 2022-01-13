package no.nav.data.team.history.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamTransferResponse {
    String navIdent;
    SimpleTeamResponse fromTeam;
    SimpleTeamResponse toTeam;
    LocalDate memberShipEndDate;
    LocalDate membershipStartDate;
}
