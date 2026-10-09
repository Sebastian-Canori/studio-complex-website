<?php
/**
 * Plugin Name: SC CRM Intake
 * Description: Public intake endpoint for the website forms (contact + newsletter).
 *              POST /sc-crm/v1/intake, protected by a shared secret. It can only
 *              create contacts, leads and newsletter group members.
 *
 * Install as a must-use plugin: wp-content/mu-plugins/sc-crm-intake.php
 * (a separate file, so the studio-complex-crm plugin is not touched).
 * Secret: wp-content/sc-crm-intake-config.php  =>  <?php return ['secret' => '...', 'owner_id' => 1];
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'rest_api_init',
	static function (): void {
		register_rest_route(
			'sc-crm/v1',
			'/intake',
			array(
				'methods'             => 'POST',
				'callback'            => 'sc_crm_intake_handle',
				'permission_callback' => 'sc_crm_intake_authorize',
			)
		);
	}
);

/**
 * Loads the config file; null when missing or without a secret.
 */
function sc_crm_intake_config(): ?array {
	$file = WP_CONTENT_DIR . '/sc-crm-intake-config.php';
	if ( ! is_file( $file ) ) {
		return null;
	}
	$config = require $file;
	if ( ! is_array( $config ) || '' === trim( (string) ( $config['secret'] ?? '' ) ) ) {
		return null;
	}
	return $config;
}

function sc_crm_intake_authorize( WP_REST_Request $request ) {
	$config = sc_crm_intake_config();
	if ( null === $config ) {
		return new WP_Error( 'sc_intake_disabled', 'Intake disabled.', array( 'status' => 503 ) );
	}

	$sent = '';
	$auth = (string) $request->get_header( 'authorization' );
	if ( 0 === stripos( $auth, 'Bearer ' ) ) {
		$sent = trim( substr( $auth, 7 ) );
	}
	if ( '' === $sent ) {
		$sent = trim( (string) $request->get_header( 'x_sc_intake_secret' ) );
	}

	if ( '' === $sent || ! hash_equals( trim( (string) $config['secret'] ), $sent ) ) {
		return new WP_Error( 'sc_intake_forbidden', 'Forbidden.', array( 'status' => 401 ) );
	}
	return true;
}

function sc_crm_intake_handle( WP_REST_Request $request ) {
	if ( ! class_exists( '\StudioComplexCRM\Core\Plugin' ) ) {
		return new WP_Error( 'sc_intake_no_crm', 'CRM plugin not active.', array( 'status' => 503 ) );
	}

	$config    = sc_crm_intake_config();
	$owner_id  = (int) ( $config['owner_id'] ?? 1 );
	$container = \StudioComplexCRM\Core\Plugin::instance()->get_container();

	$contacts = $container->make( \StudioComplexCRM\Modules\Contacts\Services\ContactsService::class );
	$leads    = $container->make( \StudioComplexCRM\Modules\Leads\Services\LeadsService::class );
	$groups   = $container->make( \StudioComplexCRM\Modules\ContactGroups\Services\ContactGroupsService::class );
	$timeline = $container->make( \StudioComplexCRM\Modules\Timeline\Services\TimelineService::class );

	$p     = $request->get_json_params();
	$p     = is_array( $p ) ? $p : array();
	$type  = sanitize_key( (string) ( $p['type'] ?? '' ) );
	$field = static fn( string $k, int $max = 300 ): string => mb_substr( sanitize_text_field( (string) ( $p[ $k ] ?? '' ) ), 0, $max );

	$email = sanitize_email( (string) ( $p['email'] ?? '' ) );
	if ( '' === $email || ! is_email( $email ) ) {
		return new WP_Error( 'sc_intake_email', 'Invalid email.', array( 'status' => 422 ) );
	}

	if ( 'newsletter' === $type ) {
		if ( empty( $p['consent'] ) ) {
			return new WP_Error( 'sc_intake_consent', 'Consent required.', array( 'status' => 422 ) );
		}
		$contact = $contacts->find_by_email( $email );
		if ( ! $contact ) {
			$contact = $contacts->create(
				array(
					'first_name' => 'Suscriptor',
					'email'      => $email,
					'origin'     => $field( 'source', 100 ) ?: 'Web - newsletter',
					'owner_id'   => $owner_id,
				)
			);
			if ( is_wp_error( $contact ) ) {
				return $contact;
			}
		}
		$group = $groups->find_or_create_by_name( 'Newsletter' );
		if ( is_wp_error( $group ) ) {
			return $group;
		}
		$groups->add_contacts_to_group( $group->id, array( $contact->id ) );
		$timeline->log( 'contact', $contact->id, 'newsletter', 'Suscripción al newsletter desde la web (con consentimiento).' );

		return new WP_REST_Response( array( 'ok' => true, 'contact_id' => $contact->id ), 201 );
	}

	if ( 'lead' !== $type ) {
		return new WP_Error( 'sc_intake_type', 'Unknown type.', array( 'status' => 422 ) );
	}

	$name = $field( 'name', 150 );
	if ( '' === $name ) {
		return new WP_Error( 'sc_intake_name', 'Name required.', array( 'status' => 422 ) );
	}

	$contact = $contacts->find_by_email( $email );
	if ( ! $contact ) {
		$contact = $contacts->create(
			array(
				'first_name' => $name,
				'email'      => $email,
				'whatsapp'   => $field( 'phone', 50 ),
				'origin'     => 'Web - formulario de contacto',
				'owner_id'   => $owner_id,
			)
		);
		if ( is_wp_error( $contact ) ) {
			return $contact;
		}
	}

	$subject = $field( 'subject', 100 );
	$lead    = $leads->find_by_contact_id( $contact->id );
	if ( ! $lead ) {
		$lead = $leads->create(
			array(
				'contact_id' => $contact->id,
				'source'     => 'Web' . ( '' !== $subject ? ' - ' . $subject : '' ),
				'owner_id'   => $owner_id,
			)
		);
		if ( is_wp_error( $lead ) ) {
			return $lead;
		}
	}

	$campaign = array();
	foreach ( array( 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'landing_page' ) as $k ) {
		if ( '' !== $field( $k ) ) {
			$campaign[] = $k . ': ' . $field( $k );
		}
	}
	$note = 'Consulta desde el formulario web.'
		. ( '' !== $subject ? "\nMotivo: " . $subject : '' )
		. ( '' !== $field( 'phone', 50 ) ? "\nTeléfono: " . $field( 'phone', 50 ) : '' )
		. ( '' !== trim( (string) ( $p['message'] ?? '' ) ) ? "\n\n" . mb_substr( sanitize_textarea_field( (string) $p['message'] ), 0, 3000 ) : '' )
		. ( $campaign ? "\n\nCampaña:\n" . implode( "\n", $campaign ) : '' );
	$timeline->log( 'lead', $lead->id, 'note', $note );

	return new WP_REST_Response( array( 'ok' => true, 'contact_id' => $contact->id, 'lead_id' => $lead->id ), 201 );
}
