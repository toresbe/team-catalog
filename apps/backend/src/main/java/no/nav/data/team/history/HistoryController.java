package no.nav.data.team.history;

import lombok.RequiredArgsConstructor;
import no.nav.data.team.history.dto.TeamTransferResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
public class HistoryController {

    private final Kverna kverna;

    @GetMapping("/team-transfers")
    public List<TeamTransferResponse> getPOTeamChanes(LocalDate from, LocalDate to){
        return kverna.getTeamChanges(from, to);
    }
}
