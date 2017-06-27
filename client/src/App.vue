<style lang="stylus">
	.body
		color red
		text-align center
		font-size 22px
</style>

<template lang="jade">
	div
		h1.title {{title}}
		.body
			span {{msg}}
		.footer
</template>

<script>
	import { getDate } from 'src/util'
	import axios from 'axios'

  export default {
    data () {
      return {
				title: 'Hello ...',
        msg: ''
      }
    },
		mounted () {
			this.msg = `This is es6App ${getDate()}`;
			axios.get('/api/users').then( (response) => {
				this.title = 'Hello ' + response.data.result;
			})
		}
  }
</script>
