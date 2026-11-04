<?php

namespace TacraftSociality\SignConfirmPassword;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\TranslatorInterface;
use Flarum\User\Event\Saving;
use Illuminate\Support\Arr;

/**
 * Makes sure the password confirmation sent by the sign up modal matches the
 * password itself before the account is created.
 *
 * Only plain sign ups are checked: registrations that carry a
 * `RegistrationToken` (third party logins such as QQ, GitHub, Microsoft or a
 * skin site) never contain a password field, and administrators are allowed to
 * create accounts through the API without confirming a password.
 */
class ValidatePassword
{
    public function __construct(protected TranslatorInterface $translator)
    {
    }

    public function handle(Saving $event): void
    {
        $user = $event->user;

        if ($user->exists) {
            return;
        }

        if ($event->actor->isAdmin()) {
            return;
        }

        $attributes = Arr::get($event->data, 'attributes', []);

        if (Arr::has($attributes, 'token')) {
            return;
        }

        $password = Arr::get($attributes, 'password');
        $confirmation = Arr::get($attributes, 'confirmPassword');

        if (! is_string($password) || $password === '') {
            // Let the core validation report a missing password.
            return;
        }

        if (! is_string($confirmation) || ! hash_equals($password, $confirmation)) {
            throw new ValidationException([
                'confirmPassword' => $this->translator->trans('tacraft-sociality-sign-confirm-password.forum.password_mismatch'),
            ]);
        }
    }
}
