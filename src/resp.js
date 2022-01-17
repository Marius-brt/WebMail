module.exports = (success, data = null) => {
    if (data) {
        if (success) return {
            success: true,
            data: data
        }
        return {
            success: false,
            error: data
        }
    } else {
        if (success) return {
            success: true
        }
        return {
            success: false
        }
    }
}