import ImagePicker from '@/features/properties/components/ImagePicker'
import type { PublicationFieldsProps } from '@/features/properties/hooks/usePublicationForm'

const PublicationPhotoFields = ({ values, errors, change }: PublicationFieldsProps) => {
  return <ImagePicker files={values.images} onChange={(images) => change('images', images)} error={errors.images} />
}

export default PublicationPhotoFields
