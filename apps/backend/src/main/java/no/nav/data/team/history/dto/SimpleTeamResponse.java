package no.nav.data.team.history.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.team.domain.TeamType;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
//@JsonPropertyOrder({"id", "action", "table", "tableId", "time", "user", "data"})
public class SimpleTeamResponse {
    UUID id;
    String name;
    UUID productAreaId;
    String productAreaName;
    TeamType teamType;
}
