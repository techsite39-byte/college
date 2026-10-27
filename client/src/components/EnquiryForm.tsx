import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '../lib/api';

const enquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20)
    .regex(/^[+\d\s().-]+$/, 'Enter a valid phone number')
    .refine((value) => (value.match(/\d/g)?.length ?? 0) >= 7, 'Enter a valid phone number'),
  courseInterest: z.string().max(120).optional(),
  message: z.string().trim().max(1200).optional(),
  consent: z.boolean().refine((value) => value, 'Please agree to be contacted'),
  website: z.string().max(0).optional(),
});

const contactEnquirySchema = enquirySchema.extend({
  subject: z.string().trim().min(1, 'Enter a subject').max(120),
  message: z.string().trim().min(1, 'Enter a message').max(1200),
});

type EnquiryValues = z.infer<typeof enquirySchema> & { subject?: string };

type EnquiryFormProps = {
  compact?: boolean;
  contactLayout?: boolean;
};

export default function EnquiryForm({ compact = false, contactLayout = false }: EnquiryFormProps) {
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionState, setSubmissionState] = useState<'success' | 'error' | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(contactLayout ? contactEnquirySchema : enquirySchema),
    defaultValues: { courseInterest: '', subject: '', message: '', consent: false },
  });

  const submitEnquiry = async (values: EnquiryValues) => {
    setSubmissionMessage('');
    setSubmissionState(null);
    try {
      await apiRequest('enquiries', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      reset();
      setSubmissionState('success');
      setSubmissionMessage('Thank you. Your enquiry has been received.');
    } catch (error) {
      setSubmissionState('error');
      setSubmissionMessage(
        error instanceof Error ? error.message : 'We could not submit your enquiry. Please try again.',
      );
    }
  };

  const inputClass = `w-full rounded-xl border border-navy/15 px-4 py-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 ${
    compact || contactLayout ? 'bg-white/95' : 'bg-ivory'
  }`;

  return (
    <form onSubmit={handleSubmit(submitEnquiry)} noValidate className="space-y-4" aria-busy={isSubmitting}>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">
          <span>{contactLayout ? 'Name and surname' : 'Your name'}</span>
          <input
            id="enquiry-name"
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'enquiry-name-error' : undefined}
            className={inputClass}
            {...register('fullName')}
          />
          {errors.fullName && <span id="enquiry-name-error" role="alert" className="block text-xs text-red-700">{errors.fullName.message}</span>}
        </label>
        {!contactLayout && (
          <label className="space-y-1.5 text-sm font-medium">
            <span>Phone number</span>
            <input
              id="enquiry-phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'enquiry-phone-error' : undefined}
              className={inputClass}
              {...register('phone')}
            />
            {errors.phone && <span id="enquiry-phone-error" role="alert" className="block text-xs text-red-700">{errors.phone.message}</span>}
          </label>
        )}
        <label className={`space-y-1.5 text-sm font-medium ${contactLayout ? '' : 'sm:col-span-2'}`}>
          <span>Email address</span>
          <input
            id="enquiry-email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
            className={inputClass}
            {...register('email')}
          />
          {errors.email && <span id="enquiry-email-error" role="alert" className="block text-xs text-red-700">{errors.email.message}</span>}
        </label>
        {contactLayout && (
          <label className="space-y-1.5 text-sm font-medium">
            <span>Phone number</span>
            <input
              id="enquiry-phone"
              type="tel"
              autoComplete="tel"
              required
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'enquiry-phone-error' : undefined}
              className={inputClass}
              {...register('phone')}
            />
            {errors.phone && <span id="enquiry-phone-error" role="alert" className="block text-xs text-red-700">{errors.phone.message}</span>}
          </label>
        )}
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          {contactLayout ? (
            <>
              <span>Subject</span>
              <input
                id="enquiry-subject"
                required
                aria-invalid={Boolean(errors.subject)}
                className={inputClass}
                {...register('subject')}
              />
              {errors.subject && <span role="alert" className="block text-xs text-red-700">{errors.subject.message}</span>}
            </>
          ) : (
            <>
              <span>Course of interest <span className="font-normal text-slate-500">(optional)</span></span>
              <select id="enquiry-course" className={inputClass} {...register('courseInterest')}>
                <option value="">Select a course</option>
                <option value="B.Ed.">B.Ed.</option>
                <option value="D.Ed.">D.Ed.</option>
              </select>
            </>
          )}
        </label>
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span>{contactLayout ? 'Message' : <>How can we help? <span className="font-normal text-slate-500">(optional)</span></>}</span>
          <textarea
            id="enquiry-message"
            rows={compact || contactLayout ? 3 : 4}
            required={contactLayout}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
            className={inputClass}
            {...register('message')}
          />
          {errors.message && <span id="enquiry-message-error" role="alert" className="block text-xs text-red-700">{errors.message.message}</span>}
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          id="enquiry-consent"
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'enquiry-consent-error' : undefined}
          className="mt-1 accent-navy"
          {...register('consent')}
        />
        <span>I agree to be contacted about this enquiry.</span>
      </label>
      {errors.consent && <p id="enquiry-consent-error" role="alert" className="text-xs text-red-700">{errors.consent.message}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${contactLayout ? 'contact-enquiry__submit' : 'button-primary'} disabled:cursor-wait disabled:opacity-60`}
      >
        {isSubmitting ? 'Sending…' : contactLayout ? 'Submit' : 'Send enquiry'}
      </button>
      <p
        role={submissionState === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        aria-atomic="true"
        className={`text-sm ${submissionState === 'success' ? 'text-green' : submissionState === 'error' ? 'text-red-700' : 'text-body'}`}
      >
        {submissionMessage}
      </p>
    </form>
  );
}
