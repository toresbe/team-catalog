package no.nav.data.team.common.security.dto;

import com.nimbusds.jwt.JWTClaimsSet;
import lombok.Value;
import no.nav.data.team.common.security.AppIdMapping;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;

import java.util.List;
import java.util.Set;

import static no.nav.data.team.common.security.SecurityConstants.APPID_CLAIM;
import static no.nav.data.team.common.security.SecurityConstants.APPID_CLAIM_V2;
import static no.nav.data.team.common.security.SecurityConstants.USER_ID_CLAIM;
import static no.nav.data.team.common.security.SecurityConstants.VER_CLAIM;
import static no.nav.data.team.common.security.dto.TeamRole.ROLE_PREFIX;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.substringAfter;

@Value
public class UserInfo {

    String appId;
    String userId;
    String ident;
    String name;
    String email;
    List<String> groups;

    public UserInfo(JWTClaimsSet jwtClaimsSet, Set<GrantedAuthority> grantedAuthorities, String identClaimName) {
        this.appId = getAppId(jwtClaimsSet);
        this.ident = getIdent(jwtClaimsSet, identClaimName);
        this.userId = getUserId(jwtClaimsSet);

        this.name = getClaim(jwtClaimsSet, StandardClaimNames.NAME);
        this.email = getEmail(jwtClaimsSet);
        groups = convert(grantedAuthorities, grantedAuthority -> substringAfter(grantedAuthority.getAuthority(), ROLE_PREFIX));
    }

    public static String getAppId(JWTClaimsSet jwtClaimsSet) {
        if (isV1(jwtClaimsSet)) {
            return (String) jwtClaimsSet.getClaim(APPID_CLAIM);
        }
        return (String) jwtClaimsSet.getClaim(APPID_CLAIM_V2);
    }

    public static String getUserId(JWTClaimsSet jwtClaimsSet) {
        return (String) jwtClaimsSet.getClaim(USER_ID_CLAIM);
    }

    private String getEmail(JWTClaimsSet jwtClaimsSet) {
        if (isV1(jwtClaimsSet)) {
            return getClaim(jwtClaimsSet, "unique_name");
        }
        return (String) jwtClaimsSet.getClaim(StandardClaimNames.PREFERRED_USERNAME);
    }

    private static boolean isV1(JWTClaimsSet jwtClaimsSet) {
        return "1.0".equals(getClaim(jwtClaimsSet, VER_CLAIM));
    }

    public String formatUser() {
        return String.format("%s - %s", ident, name);
    }

    public String getAppName() {
        return AppIdMapping.getAppNameForAppId(appId);
    }

    private static String getIdent(JWTClaimsSet jwtClaimsSet, String identClaimName) {
        String identClaim = getClaim(jwtClaimsSet, identClaimName);
        return identClaim == null ? "missing-ident" : identClaim;
    }

    @SuppressWarnings("unchecked")
    private static <T> T getClaim(JWTClaimsSet jwtClaimsSet, String claim) {
        return (T) jwtClaimsSet.getClaim(claim);
    }

    public UserInfoResponse convertToResponse() {
        return UserInfoResponse.builder()
                .loggedIn(true)
                .ident(ident)
                .name(name)
                .email(email)
                .groups(copyOf(groups))
                .build();
    }
}
