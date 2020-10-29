import { useEffect } from 'react'

export const useLogError = (name: string, error: any) => {
  useEffect(() => {
    if (error) {
      console.error(name, error)
    }
  }, [error])
}
