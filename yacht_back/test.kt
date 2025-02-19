class SomeClass {

    @syncronised
    fun doWork() {
        if (condition) {
            return someValue
        }

        doWork()
    }
}

fun main() {
    doWork()
}
