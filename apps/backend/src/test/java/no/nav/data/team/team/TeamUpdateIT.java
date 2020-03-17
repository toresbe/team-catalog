package no.nav.data.team.team;

import no.nav.common.KafkaEnvironment.BrokerStatus;
import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.avro.TeamUpdate;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import org.apache.kafka.clients.consumer.Consumer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

public class TeamUpdateIT extends KafkaTestBase {

    private Consumer<String, TeamUpdate> consumer;
    @Autowired
    private TeamService teamService;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    TeamRequest team = TeamRequest.builder()
            .name("team name")
            .description("descr")
            .members(List.of(
                    TeamMemberRequest.builder()
                            .nomId("person@nav.no")
                            .name("Navnet Vel")
                            .role("Lille rollen sin")
                            .build()
            ))
            .update(false)
            .build();

    @AfterEach
    void tearDown() {
        if (consumer != null) {
            consumer.close();
        }
    }

    @Test
    void produceTeamUpdateMessage() {
        consumer = createConsumer(teamUpdateProducer.getTopic());
        var savedTeam = teamService.save(team);

        var record = KafkaTestUtils.getSingleRecord(consumer, teamUpdateProducer.getTopic());

        assertThat(record.key()).isEqualTo(savedTeam.getId().toString());
        assertThat(storageService.get(savedTeam.getId(), Team.class).isUpdateSent()).isTrue();
    }

    @Test
    void handleKafkaDown() throws InterruptedException {
        kafkaEnvironment.getBrokers().get(0).stop();
        var savedTeam = teamService.save(team);
        Thread.sleep(2000);
        UUID id = savedTeam.getId();
        assertThat(storageService.get(id, Team.class).isUpdateSent()).isFalse();

        kafkaEnvironment.getBrokers().get(0).start();
        await().atMost(Duration.ofSeconds(10)).until(() ->
                kafkaEnvironment.getServerPark().getBrokerStatus() instanceof BrokerStatus.Available);

        jdbcTemplate.update("update generic_storage set last_modified_date = ? where id = ?", LocalDateTime.now().minusMinutes(35), id);
        teamService.catchupUpdates();
        await().atMost(Duration.ofSeconds(2)).until(() ->
                storageService.get(id, Team.class).isUpdateSent());
    }
}
