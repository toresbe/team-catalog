package no.nav.data.team.history;

import lombok.RequiredArgsConstructor;
import lombok.val;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.team.history.dto.SimpleTeamResponse;
import no.nav.data.team.history.dto.TeamTransferResponse;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.TeamMember;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class Kverna {

    private final AuditVersionRepository auditVersionRepository;

    public List<TeamTransferResponse> getTeamChanges(LocalDate from, LocalDate to){
        val quit = new HashMap<String, LocalDate>();
        val teamChanges = new ArrayList<TeamTransferResponse>();


        val snapshotFrom = new Teamkatalogen(auditVersionRepository.getLatestAuditVersionForAll(from));
        auditVersionRepository.getByTimeBetween(from, to).stream().sorted(Comparator.comparing(AuditVersion::getTime)).forEach(av -> {
            val prevVersion = snapshotFrom.getTeamById(av.getId());
            if(av.isTeam() && prevVersion.isPresent()) {
                val prevTeamData = prevVersion.get().getTeamData();
                val avTeamData = av.getTeamData();

                val prevMembers = prevTeamData.getMembers().stream().map(TeamMember::getNavIdent).toList();
                val avMembers = avTeamData.getMembers().stream().map(TeamMember::getNavIdent).toList();

                quit.putAll(
                    prevMembers.stream()
                            .filter(pm -> !avMembers.contains(pm))
                            .collect(Collectors.toMap(m -> m, m -> av.getTime().toLocalDate()))
                );

                teamChanges.addAll(
                    avMembers.stream()
                            .filter(am -> !prevMembers.contains(am))
                            .filter(quit::containsKey)
                            .map(m -> TeamTransferResponse.builder()
                                    .navIdent(m)
                                    .fromTeam(
                                            SimpleTeamResponse.builder()
                                                    .id(prevTeamData.getId())
                                                    .name(prevTeamData.getName())
                                                    .productAreaId(prevTeamData.getProductAreaId())
                                                    .productAreaName(snapshotFrom.getProductAreaById(prevTeamData.getProductAreaId())
                                                            .map(AuditVersion::getProductAreaData)
                                                            .map(ProductArea::getName)
                                                            .orElse(null)
                                                    )
                                                    .teamType(prevTeamData.getTeamType())
                                                    .build()
                                    )
                                    .toTeam(
                                            SimpleTeamResponse.builder()
                                                    .id(avTeamData.getId())
                                                    .name(avTeamData.getName())
                                                    .productAreaId(avTeamData.getProductAreaId())
                                                    .productAreaName(snapshotFrom.getProductAreaById(avTeamData.getProductAreaId())
                                                            .map(AuditVersion::getProductAreaData)
                                                            .map(ProductArea::getName)
                                                            .orElse(null)
                                                    )
                                                    .teamType(avTeamData.getTeamType())
                                                    .build()
                                    )
                                    .memberShipEndDate(quit.get(m))
                                    .membershipStartDate(av.getTime().toLocalDate())
                                    .build()
                            ).toList()
                );
            }
            snapshotFrom.saveAuditVersion(av);
        });
    }

    private class Teamkatalogen{

        private final Map<UUID, AuditVersion> teamAuditVersionByTeamId;
        private final Map<UUID, AuditVersion> poAuditVersionByPoId;

        Teamkatalogen(List<AuditVersion> data){
            this.teamAuditVersionByTeamId = data.stream().filter(AuditVersion::isTeam).collect(Collectors.toMap(av -> av.getTeamData().getId(), av -> av));
            this.poAuditVersionByPoId = data.stream().filter(AuditVersion::isProductArea).collect(Collectors.toMap(av -> av.getProductAreaData().getId(), av -> av));
        }

        public Optional<AuditVersion> getTeamById(UUID id){
            return Optional.ofNullable(teamAuditVersionByTeamId.getOrDefault(id, null));
        }

        public Optional<AuditVersion> getProductAreaById(UUID id){
            return Optional.ofNullable(poAuditVersionByPoId.getOrDefault(id, null));
        }

        public AuditVersion saveAuditVersion(AuditVersion auditVersion){
            return auditVersion.isTeam() ? teamAuditVersionByTeamId.put(auditVersion.getTeamData().getId(), auditVersion) :
            auditVersion.isProductArea() ? poAuditVersionByPoId.put(auditVersion.getProductAreaData().getId(), auditVersion) :
            null;
        }
    }
}
