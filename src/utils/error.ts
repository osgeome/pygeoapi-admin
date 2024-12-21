export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class FileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileError'
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof ConfigError) {
    return `Configuration Error: ${error.message}`
  }
  if (error instanceof ValidationError) {
    return `Validation Error: ${error.message}`
  }
  if (error instanceof FileError) {
    return `File Error: ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export const isValidYAML = (str: string): boolean => {
  // Basic YAML validation - could be enhanced
  return str.trim().length > 0 && !str.includes('\t')
}
