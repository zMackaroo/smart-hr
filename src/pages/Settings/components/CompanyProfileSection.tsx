import { Building2, Upload, X } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { CompanySettingsFormInput } from '../../../types/company.types'

interface CompanyProfileSectionProps {
  register: UseFormRegister<CompanySettingsFormInput>
  errors: FieldErrors<CompanySettingsFormInput>
  logoUrl?: string
  onLogoUpload: (file: File) => void
  onLogoRemove: () => void
  isLogoSubmitting: boolean
}

export function CompanyProfileSection({
  register,
  errors,
  logoUrl,
  onLogoUpload,
  onLogoRemove,
  isLogoSubmitting,
}: CompanyProfileSectionProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-primary">Company Profile</h2>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-alt">
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-8 w-8 text-muted" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-primary transition-colors hover:bg-surface-alt ${
              isLogoSubmitting ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isLogoSubmitting}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onLogoUpload(file)
                e.target.value = ''
              }}
            />
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {isLogoSubmitting ? 'Uploading...' : 'Replace Logo'}
          </label>
          {logoUrl && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={isLogoSubmitting}
              onClick={onLogoRemove}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Company Name" error={errors.name?.message} {...register('name')} />
        <Input label="Legal Name (optional)" error={errors.legalName?.message} {...register('legalName')} />
        <Input label="Company Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone (optional)" error={errors.phone?.message} {...register('phone')} />
        <div className="sm:col-span-2">
          <Input label="Website (optional)" error={errors.website?.message} {...register('website')} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Address Line 1" error={errors.addressLine1?.message} {...register('addressLine1')} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Address Line 2 (optional)" error={errors.addressLine2?.message} {...register('addressLine2')} />
        </div>
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State / Province (optional)" error={errors.state?.message} {...register('state')} />
        <Input label="Postal Code" error={errors.postalCode?.message} {...register('postalCode')} />
        <Input label="Country" error={errors.country?.message} {...register('country')} />
      </div>
    </section>
  )
}
