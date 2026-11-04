import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Stream from 'flarum/common/utils/Stream';
import extractText from 'flarum/common/utils/extractText';

const PREFIX = 'tacraft-sociality-sign-confirm-password';

// Core loads the sign up modal lazily, so it must be referenced by module path
// (Flarum 2 defers `extend` until the module has been loaded). Importing the
// class directly yields `undefined` at boot and the extension never applies.
const SIGN_UP_MODAL = 'flarum/forum/components/SignUpModal';

function label(): string {
  try {
    return extractText(app.translator.trans(`${PREFIX}.forum.field_placeholder`) as any);
  } catch (e) {
    return 'Confirm Password';
  }
}

app.initializers.add(PREFIX, () => {
  extend(SIGN_UP_MODAL, 'oninit', function (this: any) {
    this.confirmPassword = Stream('');
  });

  extend(SIGN_UP_MODAL, 'fields', function (this: any, items: any) {
    // Third party registrations carry a token instead of a password.
    if (this.attrs.token) {
      return;
    }

    const placeholder = label();

    items.add(
      'tacraftConfirmPassword',
      <div className="Form-group">
        <label className="label">{placeholder}</label>
        <input
          className="FormControl"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder={placeholder}
          aria-label={placeholder}
          bidi={this.confirmPassword}
          disabled={this.loading}
        />
      </div>,
      5
    );
  });

  extend(SIGN_UP_MODAL, 'submitData', function (this: any, data: any) {
    if (!this.attrs.token && typeof this.confirmPassword === 'function') {
      data.confirmPassword = this.confirmPassword();
    }
  });
});
