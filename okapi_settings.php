<?php
/***************************************************************************
 * Standalone OKAPI settings for the Docker dev stack.
 *
 * Everything installation-specific comes from environment variables
 * (set in the okapi stack's compose file):
 *   OKAPI_DB_HOST, OKAPI_DB_NAME, OKAPI_DB_USER, OKAPI_DB_PASS
 *   OKAPI_SITE_URL  - public URL of this OKAPI, with trailing slash
 *   OKAPI_OC_URL    - public URL of the legacy OC site, with trailing slash
 ***************************************************************************/

namespace okapi;

function get_okapi_settings()
{
    $env = function ($name, $default = null) {
        $value = getenv($name);
        if ($value === false || $value === '') {
            if ($default === null) {
                throw new \Exception("OKAPI standalone: environment variable $name is not set.");
            }
            return $default;
        }
        return $value;
    };

    $siteUrl = $env('OKAPI_SITE_URL');
    $ocUrl   = $env('OKAPI_OC_URL', $siteUrl);

    date_default_timezone_set('Europe/Berlin');

    return [
        'OC_BRANCH'                 => 'oc.de',
        'ADMINS'                    => ['noreply@test.opencaching.de'],
        'FROM_FIELD'                => 'noreply@test.opencaching.de',
        'DATA_LICENSE_URL'          => 'https://opencaching.de/articles.php?page=license',
        'DEBUG'                     => true,
        'DEBUG_PREVENT_SEMAPHORES'  => true,
        'DB_SERVER'                 => $env('OKAPI_DB_HOST', 'db'),
        'DB_NAME'                   => $env('OKAPI_DB_NAME', 'oc'),
        'DB_USERNAME'               => $env('OKAPI_DB_USER', 'oc'),
        'DB_PASSWORD'               => $env('OKAPI_DB_PASS'),
        'DB_CHARSET'                => 'utf8mb4',
        'SITELANG'                  => 'de',
        'TIMEZONE'                  => 'Europe/Berlin',
        'SITE_URL'                  => $siteUrl,
        'REGISTRATION_URL'          => $ocUrl . 'register.php',
        'HTTPS_ENABLED'             => false,
        'OC_NODE_ID'                => 4,
        'OC_WAYPOINT_PREFIX'        => 'OC',
        'OC_COOKIE_NAME'            => 'ocdevelopment',
        'OC_DEFAULT_LOCALE'         => 'DE',
        'OC_PAGE_TITLE'             => 'OPENCACHING.de',
        'OC_MAIL_FROM'              => 'noreply@test.opencaching.de',
        'OC_W3W_APIKEY'             => 'X27PDW41',
        'OKAPI_PREVENT_EMAILS'      => 1,
        'VAR_DIR'                   => __DIR__ . '/var/okapi',
        'IMAGES_DIR'                => __DIR__ . '/images/uploads',
        'IMAGES_URL'                => $ocUrl . 'images/uploads/',
        'IMAGE_MAX_UPLOAD_SIZE'     => 4194304,
        'IMAGE_MAX_PIXEL_COUNT'     => 786432,
        'SITE_LOGO'                 => $ocUrl . 'resource2/ocstyle/images/oclogo/oc_logo_alpha3.png',
        'VERSION_FILE'              => __DIR__ . '/okapi/meta.php',
        'GITHUB_ACCESS_TOKEN'       => '',
        // Account creation through services/users/register, with the dev website's values
        // (settings-dist: password_hash false, license newusers 2).
        'OCDE_REGISTRATION'         => [
            'password_hash' => false,
            'password_salt' => '',
            'data_license'  => 2,
            'terms_url'     => $ocUrl . 'articles.php?page=impressum#tos',
            'privacy_url'   => $ocUrl . 'articles.php?page=dsb',
        ],
    ];
}
