package no.nav.data.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.AppStarter;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.team.IntegrationTestBase.Initializer;
import no.nav.data.team.kafka.KafkaContainer;
import no.nav.data.team.kafka.SchemaRegistryContainer;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.NomRessurs;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Arrays;
import java.util.Collections;

@Slf4j
@ActiveProfiles("test")
@ExtendWith(WiremockExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {AppStarter.class})
@ContextConfiguration(initializers = {Initializer.class})
public abstract class IntegrationTestBase {

    private static final PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:11.3");

    static {
        postgreSQLContainer.start();
    }

    @Autowired
    protected TestRestTemplate restTemplate;
    @Autowired
    protected GenericStorageRepository repository;
    @Autowired
    protected AuditVersionRepository auditVersionRepository;
    @Autowired
    protected StorageService storageService;
    @Autowired
    protected NomClient nomClient;
    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUpBase() {
        repository.deleteAll();
        auditVersionRepository.deleteAll();
        nomClient.clear();
    }

    @AfterEach
    void tearDownBase() {
        repository.deleteAll();
    }

    protected Resource addNomResource(NomRessurs resource) {
        return nomClient.add(Collections.singletonList(resource)).get(0);
    }

    protected void addNomResources(NomRessurs... resources) {
        nomClient.add(Arrays.asList(resources));
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=" + postgreSQLContainer.getJdbcUrl(),
                    "spring.datasource.username=" + postgreSQLContainer.getUsername(),
                    "spring.datasource.password=" + postgreSQLContainer.getPassword(),
                    "wiremock.server.port=" + WiremockExtension.getWiremock().port(),
                    "KAFKA_BOOTSTRAP_SERVERS=" + KafkaContainer.getAddress(),
                    "KAFKA_SCHEMA_REGISTRY_URL=" + SchemaRegistryContainer.getAddress()
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }
}
