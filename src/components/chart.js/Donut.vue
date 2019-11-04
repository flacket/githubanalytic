<script>
import { doughnut, mixins} from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: doughnut,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      options: {
        responsive: true, 
        maintainAspectRatio: true
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
