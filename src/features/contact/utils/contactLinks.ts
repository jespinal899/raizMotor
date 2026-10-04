const onlyDigits = (phone: string) => phone.replace(/\D/g, '')

export const buildPhoneHref = (phone: string): string => `tel:+${onlyDigits(phone)}`

export const buildEmailHref = (email: string): string => `mailto:${email.trim()}`
